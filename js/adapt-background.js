import Adapt from 'core/js/adapt';
import BackgroundImageView from './backgroundImageView';
import BackgroundVideoView from './backgroundVideoView';

class Background extends Backbone.Controller {

  initialize() {
    this.listenToOnce(Adapt, 'app:dataReady', this.onDataReady);
  }

  onDataReady() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.listenTo(Adapt, 'contentObjectView:postRender articleView:postRender blockView:postRender', this.loadView);
  }

  setColor(view) {
    $(view.el).css({
      "background-color": view.model.get('_background')._color
    });
  }

  setGradient(view) {
    this.gradientType = view.model.get('_background')._gradient._type;
    this.gradientColors = view.model.get('_background')._gradient._colors;

    let type = "";

    switch (this.gradientType) {
    case "Bottom Left to Top Right":
      type = "linear-gradient(to right top,";
      break;
    case "Left to Right":
      type = "linear-gradient(to right,";
      break;
    case "Top Left to Bottom Right":
      type = "linear-gradient(to right bottom,";
      break;
    case "Top to Bottom":
      type = "linear-gradient(to bottom,";
      break;
    case "Radial":
      type = "radial-gradient(";
      break;
    case "Radial Top":
      type = "radial-gradient(ellipse at top,";
      break;
    case "Radial Bottom":
      type = "radial-gradient(ellipse at bottom,";
      break;
    case "Radial Left":
      type = "radial-gradient(ellipse at left,";
      break;
    case "Radial Right":
      type = "radial-gradient(ellipse at right,";
      break;
    }

    this.image = type+this.gradientColors+')';

    if (view.model.get('_type') == "page") {
      $('.page').css("background-image", this.image);
    } else {
      $(view.el).css("background-image", this.image);
    }
  }

  loadView(view) {
    if (!view.model.get('_background') || !view.model.get('_background')._isEnabled) return;

    // Color or Gradient
    if (view.model.get('_background')._gradient && view.model.get('_background')._gradient._isEnabled) {
      this.setGradient(view);
    } else {
      this.setColor(view);
    }

    // Video
    if (view.model.get('_background')._video && view.model.get('_background')._video._isEnabled) {
      new BackgroundVideoView({
        model: view.model
      });
    }

    // Image
    if (view.model.get('_background')._image && view.model.get('_background')._image._isEnabled) {
      new BackgroundImageView({
        model: view.model
      });
    }
  }
}

export default new Background();
