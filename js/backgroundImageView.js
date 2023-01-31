import Adapt from 'core/js/adapt';
import device from 'core/js/device';

export default class BackgroundImageView extends Backbone.View {

  className() {
    return 'background-image';
  }

  initialize() {
    this.render();
    this.listenTo(Adapt, 'remove', this.remove);
    this.listenTo(Adapt, 'device:changed', this.setBackgroundImage);
    this.listenToOnce(Adapt, 'menuView:ready', this.setBackgroundImage);
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates['backgroundImage'];

    // Set container based on the view, if a menu then add '.menu-' to the _id
    if (this.model.get('_type') == "menu") {
      this.container = $('.menu');
      $(this.el).html(template(data)).prependTo(this.container);
    } else if (this.model.get('_type') == "page") {
      // Do not render template as the image will be added to the page directly with css
      this.container = $('.page');
    } else {
      this.container = $('.'+this.model.get("_id"));
      $(this.el).html(template(data)).prependTo(this.container);
    }

    $(this.container).addClass('background-is-enabled');

    this.config = this.model.get('_background')._image;

    this.position = this.config._position;
    this.size = this.config._size;
    this.repeat = this.config._repeat;
    this.attachment = this.config._attachment;
    this.opacity = this.config._opacity ? this.config._opacity: 1;

    this.setBackgroundImage();
  }

  setBackgroundImage() {
    this.image = 'none';
    this.altText = null;

    // Check device size
    if (device.screenSize === 'large') {
      if (this.config._largeSrc) {
        this.image = 'url('+this.config._largeSrc+')';
      }
      if (this.config.largeAlt && !this.config.largeAlt == "") {
        this.altText = this.config.largeAlt;
      }
    } else if (device.screenSize === 'medium') {
      if (this.config._mediumSrc) {
        this.image = 'url('+this.config._mediumSrc+')';
      }
      if (this.config.mediumAlt && !this.config.mediumAlt == "") {
        this.altText = this.config.mediumAlt;
      }
    } else if (device.screenSize === 'small') {
      if (this.config._smallSrc) {
        this.image = 'url('+this.config._smallSrc+')';
      }
      if (this.config.smallAlt && !this.config.smallAlt == "") {
        this.altText = this.config.smallAlt;
      }
    }

    if (this.model.get('_type') == "page") {
      $(this.container).css({
        "background-image": this.image,
        "background-position": this.position,
        "background-size": this.size,
        "background-repeat": this.repeat,
        "background-attachment": this.attachment
      });
    } else {
      $(this.el).css({
        "background-image": this.image,
        "background-position": this.position,
        "background-size": this.size,
        "background-repeat": this.repeat,
        "background-attachment": this.attachment,
        "opacity": this.opacity
      });
    }

    // Check for image alt tag
    if (this.altEnabled) {
      if (this.model.get('_type') == "page") {
        $(this.container).attr("aria-label", this.altText);
      } else {
        $(this.el).attr("aria-label", this.altText);
      }
    }
  }
}
