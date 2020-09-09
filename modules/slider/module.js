/* js[modules] */
MODULE = {
  params: "",
  description: "Slider",
  icon: '<i class="far fa-images"></i>',
  firstOpen: (params, form) => {
    createSimpleList({
      name: "cms_slides",
      fields: {
        title: {},
        published: {},
        slide: {},
      },
      render: () => {
        return `
              <div style="flex-grow: 1;">
                    <span class="field-title">Tytuł <input type='text' class='field inline' data-list-param="title"></span>
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
        title: "",
        published: 1,
        content: `
          <div class="cms-container" style="" data-desktop-min-height="">
            <div class="background-color" style="background-color: rgb(20, 0, 205); opacity: 0.25;"></div>
            <div class="cms-container-content">
              <div class="cms-block align-vertical-center align-horizontal-center" data-desktop-min-height="" data-desktop-width="100%" data-mobile-min-height="" data-mobile-width="100%" data-margin_top="" data-margin_left="" data-margin_right="" data-margin_bottom="" style="width: 100%;">
                <div class="cms-block-content ql-editor" data-padding_top="12px" data-padding_left="12px" data-padding_right="12px" data-padding_bottom="12px" style="padding: 12px;"><p class="ql-align-center"><br></p><p class="ql-align-center"><br></p><h2 class="ql-align-center">Mój slajd</h2><p class="ql-align-center"><br></p><p class="ql-align-center"><br></p></div>
              </div>
            </div>
          </div>
        `,
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
