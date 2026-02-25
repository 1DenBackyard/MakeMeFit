#!/usr/bin/env python3
"""Простой скрипт для запуска ngrok туннеля."""
from pyngrok import ngrok
import time
import sys
import ssl
import os

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    print(f"🚀 Starting ngrok tunnel on port {port}...")
    
    try:
        # Попытка исправить SSL проблемы
        try:
            tunnel = ngrok.connect(port)
        except Exception as e:
            if "CERTIFICATE_VERIFY_FAILED" in str(e) or "SSL" in str(e):
                print("⚠️  SSL certificate issue detected.")
                print("💡 Trying to fix SSL certificates...")
                
                # Попытка установить сертификаты
                import subprocess
                import platform
                
                if platform.system() == "Darwin":  # macOS
                    print("📦 Installing certificates for macOS...")
                    try:
                        # Запускаем установку сертификатов Python
                        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "certifi"], check=True)
                        import certifi
                        os.environ['SSL_CERT_FILE'] = certifi.where()
                        os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
                        print("✅ Certificates updated, retrying...")
                        tunnel = ngrok.connect(port)
                    except Exception as e2:
                        print(f"❌ Could not fix SSL automatically: {e2}")
                        print("\n🔧 Manual fix options:")
                        print("1. Install certificates: /Applications/Python\\ 3.*/Install\\ Certificates.command")
                        print("2. Or download ngrok manually: https://ngrok.com/download")
                        print("3. Or use: pip install --upgrade certifi")
                        sys.exit(1)
                else:
                    raise e
            else:
                raise e
        
        print(f"\n✅ Public URL: {tunnel.public_url}")
        print(f"🔗 Forwarding: {tunnel.public_url} -> http://localhost:{port}")
        print("\nPress Ctrl+C to stop\n")
        
        # Держим туннель открытым
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping tunnel...")
        ngrok.kill()
        print("✅ Tunnel closed")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Alternative solutions:")
        print("1. Download ngrok manually: https://ngrok.com/download")
        print("2. Fix SSL: pip install --upgrade certifi")
        print("3. macOS: Run /Applications/Python\\ 3.*/Install\\ Certificates.command")
        sys.exit(1)

if __name__ == "__main__":
    main()
