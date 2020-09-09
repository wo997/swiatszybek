/* js[modules] */
MODULE = {
  params: "",
  description: "Slider zdjęć",
  icon: '<i class="far fa-images"></i>',
  firstOpen: (params, form) => {
    createSimpleList({
      name: "cms_slides",
      fields: {
        slide: {},
      },
      render: () => {
        return `
              <div style="flex-grow: 1;">
                    <span class="field-title">Tytuł <input type='text' class='field inline' data-list-param="color"></span>
                    <label class="field-title checkbox-wrapper">
                      Czy publiczny?
                      <input type="checkbox" data-list-param="published">
                      <div class="checkbox"></div>
                    </label>
                    <span class="field-title">
                      Zawartość
                      <button onclick="MODULE.editSlide($(this).parent().next())" class="btn primary" style="white-space: nowrap;">
                        Edytuj <i class="far fa-edit"></i>
                      </button>
                    </span>
                    <div class="cms preview_html" data-list-param="content" data-type="html" style="max-width: 400px;max-height: 200px;"></div>
              </div>
          `;
      },
      default_row: {
        value_id: -1,
        value: "",
        color: "",
      },
      title: "Banery",
      onChange: () => {
        MODULE.form
          .find(`[name="desktop-slider-height"]`)
          .dispatchEvent(new Event("change"));
        resizeCallback();
      },
    });
  },
  formOpen: (params, form) => {
    setTimeout(() => {
      resizeCallback();
    }, 450);
  },
  formClose: (form_data) => {
    return form_data;
  },
  render: (params) => {
    return `xxx`;
  },
  editSlide: (node) => {
    //fileManager.setDefaultName(); // inherit from top
    var id = "dsfgsdfgsgfdf";
    document.body.insertAdjacentHTML(
      "beforeend",
      `<style id='${id}'>
        /*.delete_block_btn,*/ .insert_container_btn {
          display: none !important;
        }
    </style>`
    );
    editCMSAdditional(node, {
      onChange: (cms_container) => {
        MODULE.setAllCSS(cms_container);
      },
      hideCallback: () => {
        var x = $(`#${id}`);
        if (x) {
          x.remove();
        }
      },
      delete_block_with_parent: false,
    });

    setTimeout(() => {
      resizeCallback();
    }, 450);
  },
  sliderHeightChanged: (input) => {
    MODULE.setAllCSS(MODULE.form);

    //name="desktop-slider-height"
  },
  setAllCSS: (parent) => {
    var h = MODULE.form.find(`[name="desktop-slider-height"]`).getValue();
    parent.findAll(".cms-container").forEach((e) => {
      console.log(e);
      e.setAttribute("data-desktop-min-height", h);
    });
    resizeCallback();
  },
};
