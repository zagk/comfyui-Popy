/**
 * ComfyUI - Multiline String Node 클립보드 버튼
 */

import { app } from "../../scripts/app.js";

// ─────────────────────────────────────────────────────────────
// 공통 유틸
// ─────────────────────────────────────────────────────────────

function createButton(label, color) {
  const btn = document.createElement("button");
  btn.textContent = label;
  Object.assign(btn.style, {
    width: "90%",
    height: "32px",
    padding: "0 12px",
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    letterSpacing: "0.03em",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
    flexShrink: "0",
  });
  btn.addEventListener("mouseenter", () => (btn.style.opacity = "0.85"));
  btn.addEventListener("mouseleave", () => (btn.style.opacity = "1"));
  btn._baseColor = color;
  return btn;
}

/**
 * 버튼을 감싸는 고정 높이 래퍼
 * computeSize 에서 이 높이를 그대로 사용하게 됩니다.
 */
function createButtonWrapper(btn) {
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "40px",       // 고정 높이
    minHeight: "40px",
    maxHeight: "40px",
    marginTop: "2px",
    boxSizing: "border-box",
    overflow: "hidden",   // 넘치면 자르기
  });
  wrapper.appendChild(btn);
  return wrapper;
}

function flashSuccess(btn, successLabel) {
  const orig = btn.textContent;
  const origColor = btn._baseColor;
  btn.textContent = successLabel;
  btn.style.background = "#2e7d32";
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = origColor;
  }, 600);
}

function flashError(btn, errorLabel) {
  const orig = btn.textContent;
  const origColor = btn._baseColor;
  btn.textContent = errorLabel;
  btn.style.background = "#b71c1c";
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = origColor;
  }, 1000);
}

// ─────────────────────────────────────────────────────────────
// MultilineStringNode — Paste 버튼
// ─────────────────────────────────────────────────────────────

app.registerExtension({
  name: "utils.text.MultilineStringNode.PasteButton",

  async nodeCreated(node) {
    if (node.comfyClass !== "MultilineStringNode") return;

    const btn = createButton("📋 Paste", "#1565c0");

    btn.addEventListener("click", async () => {
      try {
        const clipText = await navigator.clipboard.readText();
        const textWidget = node.widgets?.find((w) => w.name === "text");
        if (!textWidget) { alert("text 위젯을 찾을 수 없습니다."); return; }
        textWidget.value = clipText;
        node.setDirtyCanvas(true, true);
        flashSuccess(btn, "✅ Pasted!");
      } catch (err) {
        console.error("[MultilineStringNode] 클립보드 읽기 실패:", err);
        flashError(btn, "⚠️ Denied");
      }
    });

    const wrapper = createButtonWrapper(btn);

    const domWidget = node.addDOMWidget("paste_btn", "btn", wrapper, {
      getValue() { return null; },
      setValue() {},
      // 항상 고정 높이 반환 → 노드 크기 변경시 늘어나지 않음
      getMinHeight() { return 40; },
    });

    // computeSize 오버라이드 - 버튼 위젯 높이를 40px 고정
    if (domWidget) {
      domWidget.computeSize = () => [0, 40];
    }
  },
});

// ─────────────────────────────────────────────────────────────
// StringPreviewNode — 텍스트 표시 영역 + Copy 버튼
// ─────────────────────────────────────────────────────────────

app.registerExtension({
  name: "utils.text.StringPreviewNode.Preview",

  async nodeCreated(node) {
    if (node.comfyClass !== "StringPreviewNode") return;

    // ── 1) textarea: 노드 크기 변경 시 이 부분만 늘어남 ────────
    const textarea = document.createElement("textarea");
    Object.assign(textarea.style, {
      width: "100%",
      // 높이를 고정하지 않고 부모가 주는 만큼 사용
      height: "100%",
      minHeight: "60px",
      padding: "6px",
      background: "#1a1a1a",
      color: "#e0e0e0",
      border: "1px solid #444",
      borderRadius: "4px",
      fontSize: "12px",
      fontFamily: "monospace",
      resize: "none",           // 자체 resize 핸들 제거 (노드 드래그로만 조절)
      boxSizing: "border-box",
    });
    textarea.readOnly = true;
    textarea.placeholder = "실행 후 결과가 여기에 표시됩니다...";

    // textarea 래퍼: 남은 공간을 모두 차지
    const textareaWrapper = document.createElement("div");
    Object.assign(textareaWrapper.style, {
      width: "100%",
      // flex-grow 로 버튼 높이를 제외한 나머지를 모두 차지
      flexGrow: "1",
      minHeight: "60px",
      boxSizing: "border-box",
      marginTop: "4px",
      display: "flex",
      flexDirection: "column",
    });
    textareaWrapper.appendChild(textarea);

    node.addDOMWidget("preview_text", "preview", textareaWrapper, {
      getValue() { return textarea.value; },
      setValue(v) { textarea.value = v ?? ""; },
    });

    // ── 2) Copy 버튼 (고정 높이) ───────────────────────────────
    const btn = createButton("📄 Copy", "#6a1b9a");

    btn.addEventListener("click", async () => {
      const copyText = textarea.value;
      if (!copyText) { flashError(btn, "⚠️ No text"); return; }
      try {
        await navigator.clipboard.writeText(copyText);
        flashSuccess(btn, "✅ Copied!");
      } catch (err) {
        console.error("[StringPreviewNode] 클립보드 쓰기 실패:", err);
        flashError(btn, "⚠️ Denied");
      }
    });

    const btnWrapper = createButtonWrapper(btn);

    const copyWidget = node.addDOMWidget("copy_btn", "btn", btnWrapper, {
      getValue() { return null; },
      setValue() {},
      getMinHeight() { return 40; },
    });

    if (copyWidget) {
      copyWidget.computeSize = () => [0, 40];
    }

    // ── 3) 실행 완료 콜백 ──────────────────────────────────────
    node.onExecuted = function (data) {
      const text = data?.text;
      if (Array.isArray(text)) {
        textarea.value = text.join("\n");
      } else if (typeof text === "string") {
        textarea.value = text;
      }
    };
  },
});
