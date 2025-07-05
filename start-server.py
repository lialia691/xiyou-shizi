#!/usr/bin/env python3
"""
西游识字 - 本地服务器启动脚本
支持跨网络访问，方便手机测试
"""

import http.server
import socketserver
import socket
import sys
import os
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """支持CORS的HTTP请求处理器"""
    
    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_OPTIONS(self):
        """处理OPTIONS请求"""
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.address_string()}] {format % args}")

def get_local_ip():
    """获取本机IP地址"""
    try:
        # 连接到一个远程地址来获取本地IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def find_available_port(start_port=8888):
    """找到可用的端口"""
    for port in range(start_port, start_port + 100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    return None

def main():
    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 找到可用端口
    port = find_available_port()
    if port is None:
        print("❌ 无法找到可用端口")
        sys.exit(1)
    
    # 获取本机IP
    local_ip = get_local_ip()
    
    print("🚀 启动西游识字本地服务器...")
    print(f"📁 服务目录: {os.getcwd()}")
    print(f"🌐 端口: {port}")
    print(f"💻 本机IP: {local_ip}")
    print()
    print("📱 访问地址:")
    print(f"   电脑访问: http://localhost:{port}")
    print(f"   手机访问: http://{local_ip}:{port}")
    print()
    print("🔧 调试页面:")
    print(f"   http://{local_ip}:{port}/mobile-debug.html")
    print()
    print("⚠️  确保手机和电脑在同一WiFi网络下")
    print("🛑 按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        # 启动服务器，绑定到所有网络接口
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
