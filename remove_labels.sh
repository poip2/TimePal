#!/bin/bash

# 删除GitHub Issues脚本中的--label参数的脚本
# 这个脚本会读取create_issues.sh并删除所有的--label参数

echo "开始删除GitHub Issues脚本中的--label参数..."

# 创建备份文件
cp create_issues.sh create_issues_backup.sh
echo "已创建备份文件: create_issues_backup.sh"

# 使用sed删除--label参数及其值
# 匹配模式: --label "xxx,xxx,xxx" 并删除
sed -i 's/[[:space:]]*--label[[:space:]]*"[^"]*"//g' create_issues.sh

# 检查是否成功
if [ $? -eq 0 ]; then
    echo "✅ 成功删除所有--label参数"
    echo "原始文件已备份为: create_issues_backup.sh"
    echo "修改后的文件: create_issues.sh"
else
    echo "❌ 删除过程中出现错误"
    exit 1
fi

# 显示修改后的文件差异
echo ""
echo "修改后的文件内容预览:"
echo "========================"
head -20 create_issues.sh
echo "..."

# 统计删除的标签数量
LABEL_COUNT=$(grep -c "backend\|frontend\|auth\|api\|security" create_issues_backup.sh | grep -v "echo" | wc -l)
echo ""
echo "已删除的标签参数数量: $LABEL_COUNT"

echo ""
echo "操作完成！您可以使用以下命令验证修改："
echo "diff create_issues_backup.sh create_issues.sh"
