"""
ComfyUI Multiline String Input Node
- 왼쪽: 텍스트 입력 (input)
- 오른쪽: 문자열 출력 (output)
"""


class MultilineStringNode:
    """
    멀티라인 문자열 입력 노드.
    텍스트 영역에 여러 줄의 텍스트를 입력받아 STRING 타입으로 출력합니다.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "placeholder": "텍스트를 입력하세요...",
                    },
                ),
            },
            "optional": {
                "prefix": (
                    "STRING",
                    {
                        "multiline": False,
                        "default": "",
                        "placeholder": "앞에 붙일 텍스트 (선택)",
                    },
                ),
                "suffix": (
                    "STRING",
                    {
                        "multiline": False,
                        "default": "",
                        "placeholder": "뒤에 붙일 텍스트 (선택)",
                    },
                ),
                # wrap_multiline: True  → prefix\ntext\nsuffix
                #                False → prefixTextsuffix (한 줄)
                "wrap_multiline": (
                    "BOOLEAN",
                    {
                        "default": True,
                        "label_on": "wrap: multiline",
                        "label_off": "wrap: inline",
                    },
                ),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_text"
    CATEGORY = "utils/text"

    @classmethod
    def IS_CHANGED(cls, text, prefix="", suffix="", wrap_multiline=True):
        return float("nan")

    def process_text(
        self,
        text: str,
        prefix: str = "",
        suffix: str = "",
        wrap_multiline: bool = True,
    ) -> tuple:
        if wrap_multiline:
            # true → prefix/suffix가 빈 문자열이어도 줄로 포함
            # 예) <<\naaa\n>>
            parts = []
            if prefix is not None:
                parts.append(prefix)
            parts.append(text)
            if suffix is not None:
                parts.append(suffix)
            result = "\n".join(parts)
        else:
            # false → 줄바꿈 없이 한 줄로 붙이기
            # 예) <<aaa>>
            result = f"{prefix}{text}{suffix}"

        return (result,)


# ──────────────────────────────────────────────
# 추가 유틸리티 노드: 문자열 미리보기
# ──────────────────────────────────────────────

class StringPreviewNode:
    """
    STRING 입력을 받아 UI에 미리보기로 표시하는 노드.
    실제 출력은 없고 UI 표시 전용입니다.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
            },
        }

    RETURN_TYPES = ()
    FUNCTION = "preview"
    OUTPUT_NODE = True
    CATEGORY = "utils/text"

    def preview(self, text: str, unique_id=None):
        print(f"[StringPreview] id={unique_id} 길이: {len(text)}자")
        return {"ui": {"text": [text]}}


# ──────────────────────────────────────────────
# ComfyUI 노드 등록
# ──────────────────────────────────────────────

NODE_CLASS_MAPPINGS = {
    "MultilineStringNode": MultilineStringNode,
    "StringPreviewNode": StringPreviewNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "MultilineStringNode": "Multiline String Input zk📝",
    "StringPreviewNode": "String Preview zk👁️",
}
