#!/bin/bash

# create_issues_fixed.sh - 修复版的issues创建脚本
# 使用方法: ./create_issues_fixed.sh [repository]

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
CONFIG_FILE="issues-config-habitica.json"
REPO="${1:-}"  # 仓库参数可选

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}🔍 检查依赖...${NC}"

    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ 错误: 需要安装 jq 来解析JSON${NC}"
        exit 1
    fi

    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ 错误: 需要安装 GitHub CLI (gh)${NC}"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        echo -e "${RED}❌ 错误: GitHub CLI 未认证${NC}"
        echo "请运行: gh auth login"
        exit 1
    fi

    echo -e "${GREEN}✅ 所有依赖检查通过${NC}"
}

# 检查配置文件
check_config_file() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo -e "${RED}❌ 错误: 配置文件 $CONFIG_FILE 不存在${NC}"
        exit 1
    fi

    if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${RED}❌ 错误: $CONFIG_FILE 不是有效的JSON格式${NC}"
        exit 1
    fi

    local issue_count=$(jq '. | length' "$CONFIG_FILE")
    if [[ $issue_count -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  警告: 配置文件中没有找到任何issues${NC}"
        exit 0
    fi

    echo -e "${GREEN}✅ 配置文件检查通过，找到 $issue_count 个issues${NC}"
    return $issue_count
}

# 检查issue是否已存在
check_issue_exists() {
    local title="$1"
    local repo="$2"

    # 使用更简单的方式检查
    local search_title=$(echo "$title" | sed 's/[^a-zA-Z0-9]/./g')

    if [[ -n "$repo" ]]; then
        gh issue list --repo "$repo" --search "$search_title" --json title --jq '.[].title' | grep -q "^$(echo "$title" | sed 's/[^a-zA-Z0-9]/./g')$"
    else
        gh issue list --search "$search_title" --json title --jq '.[].title' | grep -q "^$(echo "$title" | sed 's/[^a-zA-Z0-9]/./g')$"
    fi
}

# 创建单个issue
create_single_issue() {
    local title="$1"
    local body="$2"
    local repo="$3"
    local index="$4"
    local total="$5"

    echo -e "${BLUE}[$index/$total] 创建 issue: $title${NC}"

    # 检查是否已存在
    if check_issue_exists "$title" "$repo"; then
        echo -e "${YELLOW}⚠️  跳过: issue '$title' 已存在${NC}"
        return 2  # 返回2表示跳过
    fi

    # 准备命令
    local cmd="gh issue create"
    if [[ -n "$repo" ]]; then
        cmd="$cmd --repo $repo"
    fi

    # 创建临时文件
    local temp_file=$(mktemp)
    printf "%s" "$body" > "$temp_file"

    # 执行创建
    local output
    if output=$($cmd --title "$title" --body-file "$temp_file" 2>&1); then
        echo -e "${GREEN}✅ 成功创建: $title${NC}"
        echo "   $output"
        rm -f "$temp_file"
        return 0
    else
        echo -e "${RED}❌ 创建失败: $title${NC}"
        echo "   错误: $output"
        rm -f "$temp_file"
        return 1
    fi
}

# 主处理函数
process_issues() {
    local total_issues=$1

    echo -e "${BLUE}📝 开始批量创建 $total_issues 个issues...${NC}"

    local success_count=0
    local skip_count=0
    local error_count=0

    for ((i=0; i<total_issues; i++)); do
        local title=$(jq -r ".[$i].title" "$CONFIG_FILE")
        local body=$(jq -r ".[$i].body" "$CONFIG_FILE")

        # 跳过空标题
        if [[ -z "$title" || "$title" == "null" ]]; then
            echo -e "${YELLOW}⚠️  跳过第 $((i+1)) 个issue: 标题为空${NC}"
            ((error_count++))
            continue
        fi

        # 创建issue
        create_single_issue "$title" "$body" "$REPO" $((i+1)) $total_issues
        case $? in
            0) ((success_count++)) ;;
            1) ((error_count++)) ;;
            2) ((skip_count++)) ;;
        esac

        # 添加延迟避免API限制
        sleep 1
    done

    # 显示总结
    echo "================================"
    echo -e "${GREEN}✅ 成功创建: $success_count${NC}"
    echo -e "${YELLOW}⚠️  已存在跳过: $skip_count${NC}"
    if [[ $error_count -gt 0 ]]; then
        echo -e "${RED}❌ 创建失败: $error_count${NC}"
    fi
    echo "================================"

    if [[ $error_count -eq 0 && $success_count -gt 0 ]]; then
        echo -e "${GREEN}🎉 所有操作完成！${NC}"
        return 0
    elif [[ $success_count -eq 0 ]]; then
        echo -e "${YELLOW}⚠️  没有创建任何新issues${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠️  部分操作失败${NC}"
        return 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}🚀 TimePal Issues 创建工具 (修复版)${NC}"
    echo "================================"

    # 检查依赖
    check_dependencies

    # 检查配置文件
    check_config_file
    local total_issues=$?

    # 确认操作
    if [[ -n "$REPO" ]]; then
        echo -e "${YELLOW}⚠️  将在仓库: $REPO 中创建issues${NC}"
    else
        echo -e "${YELLOW}⚠️  将在当前仓库中创建issues${NC}"
    fi

    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi

    # 处理issues
    process_issues $total_issues
}

# 显示帮助
show_help() {
    echo "使用方法: $0 [repository]"
    echo ""
    echo "参数:"
    echo "  repository    可选，指定GitHub仓库 (格式: owner/repo)"
    echo ""
    echo "示例:"
    echo "  $0                    # 在当前仓库创建issues"
    echo "  $0 username/repo      # 在指定仓库创建issues"
}

# 处理命令行参数
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
