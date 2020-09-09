/* js[modules] */
var module_name = "custom-html";
modules[module_name] = {
  params: "",
  description: "Moduł HTML",
  icon: '<i class="fas fa-code"></i>',
  form: `
    <div style="width:600px; max-width:90vw;">
        <div class="field-title">HTML</div>
        <textarea class="field html" style="height:400px"></textarea>
    </div>
    `,
  formOpen: (params, block) => {
    $("#custom-html .html").setValue(
      block.querySelector(".cms-block-content .html-container").innerHTML
    );
  },
  formClose: () => {
    cmsTarget.querySelector(`.cms-block-content .html-container`).innerHTML = $(
      "#custom-html .html"
    ).getValue();
  },
};
