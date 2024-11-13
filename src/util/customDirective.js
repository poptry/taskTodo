//自定义指令
// 防抖指令，避免短时间内多次触发
const debounce = {
  bind(el, binding) {
    const delay = binding.value || 500;
    let timeout;
    el.addEventListener("click", () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        binding.value();
      }, delay);
    });
  },
};

// 拖拽指令
const drag = {
  bind(el) {
    el.style.position = "absolute";
    el.onmousedown = function (event) {
      const offsetX = event.clientX - el.offsetLeft;
      const offsetY = event.clientY - el.offsetTop;

      document.onmousemove = function (event) {
        el.style.left = event.clientX - offsetX + "px";
        el.style.top = event.clientY - offsetY + "px";
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
};

// 复制文本指令
const copy = {
  bind(el) {
    el.addEventListener("click", () => {
      const textToCopy = el.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("复制成功！");
      });
    });
  },
};

// 导出所有指令
export default {
  debounce,
  drag,
  copy,
};
