#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为中文JSON文件批量添加注音
"""

import json
import re
from pypinyin import pinyin, Style

def add_pinyin_to_json(input_file, output_file):
    """
    为JSON文件中的汉字批量添加注音
    """
    try:
        # 读取原始文件内容
        with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        
        print(f"原始文件包含 {len(data)} 个汉字条目")
        
        # 为每个汉字添加注音
        for item in data:
            char = item["汉字"]
            # 使用pypinyin获取注音
            py = pinyin(char, style=Style.TONE)[0][0]
            item["注音"] = py
        
        # 保存修改后的文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"已成功为 {len(data)} 个汉字添加注音")
        print(f"文件已保存为: {output_file}")
        return True
        
    except Exception as e:
        print(f"处理过程中出现错误: {e}")
        return False

if __name__ == "__main__":
    print("中文汉字注音批量添加工具")
    print("=" * 40)
    
    # 添加注音
    success = add_pinyin_to_json('chinaword2500.json', 'chinaword2500_with_pinyin.json')
    
    if success:
        print("注音添加完成！")
    else:
        print("注音添加失败！")