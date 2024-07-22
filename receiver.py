import socket

def receive_data(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.bind((host, port))
        print(f"Listening on {host}:{port}...")

        while True:
            data, addr = sock.recvfrom(1024)  # Buffer size is 1024 bytes
            print(f"Received data from {addr}:")
            print(data.decode('utf-8'))  # Assuming data is UTF-8 encoded

if __name__ == "__main__":
    host = '127.0.0.1'  # Replace with your PUBLISHING_IP if different
    port = 9877  # Replace with your PUBLISHING_PORT if different

    receive_data(host, port)
