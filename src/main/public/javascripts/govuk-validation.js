(function (window, $) {
  function isSelect(element) {
    return element.tagName.toLowerCase() === "select";
  }

  function isCheckable(element) {
    var type = (element.type || "").toLowerCase();
    return type === "checkbox" || type === "radio";
  }

  function getInputErrorClass(element) {
    return isSelect(element) ? "govuk-select--error" : "govuk-input--error";
  }

  window.ccdAdminInitializeValidation = function (form, options) {
    var $form = $(form);
    var defaultOptions = {
      onkeyup: function (element) {
        if (!isSelect(element)) {
          $(element).valid();
        }
      },
      onclick: function (element) {
        if (isCheckable(element)) {
          $(element).valid();
        }
      },
      onfocusout: false,
      errorPlacement: function (error, element) {
        error.insertBefore(element);
      },
      errorElement: "div",
      errorElementClass: "error",
      errorClass: "govuk-error-message",
      highlight: function (element) {
        $(element).addClass(getInputErrorClass(element));
        $(element).closest(".govuk-form-group").addClass("govuk-form-group--error");
      },
      unhighlight: function (element) {
        $(element).removeClass(getInputErrorClass(element));
        $(element).closest(".govuk-form-group").removeClass("govuk-form-group--error");
      }
    };

    $form.validate($.extend({}, defaultOptions, options));
    $form.on("change.ccdAdminValidation", "select", function () {
      $(this).valid();
    });
  };
})(window, window.jQuery);
