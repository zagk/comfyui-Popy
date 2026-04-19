"""
ComfyUI Multiline String Node - 패키지 초기화 파일
이 파일을 custom_nodes/multiline_string_node/ 폴더에 넣으세요.
"""

from .multiline_string_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
