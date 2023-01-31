import Adapt from 'core/js/adapt';
import device from 'core/js/device';

export default class BackgroundVideoView extends Backbone.View {

  className() {
    return 'background-video';
  }

  initialize() {
    this.listenTo(Adapt, {
      'remove': this.remove,
      'popup:opened': this.popupOpened,
      'popup:closed': this.popupClosed,
      'device:changed': this.deviceChanged
    });

    this.render();
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates['backgroundVideo'];

    $(this.el).html(template(data)).prependTo('.'+this.model.get("_id"));

    this.modelID = '.'+this.model.get('_id');
    this.video = this.$('video')[0];
    this.firstRun = true;
    this.notifyIsOpen = false;
    this.audioPromptIsOpen = false;
    this.videoIsInView = false;

    $(this.modelID).on('onscreen', this.onscreen.bind(this));

    this.deviceChanged();

    _.delay(() => {
      this.popupOpened();
    }, 500);
  }

  popupOpened() {
    if ($('.notify__container').find('.audio-prompt').css('visibility') == 'visible') {
      this.playVideo(false);
      this.audioPromptOpened();
    } else if ($('.notify__container').find('.notify').css('visibility') == 'visible') {
      this.playVideo(false);
      this.notifyOpened();
    }
  }

  notifyOpened() {
    this.notifyIsOpen = true;
  }

  audioPromptOpened() {
    this.audioPromptIsOpen = true;
  }

  popupClosed() {
    if (this.audioPromptIsOpen) {
      this.audioPromptIsOpen = false;

      if (this.videoIsInView) {
        _.delay(() => {
          this.playVideo(true);
          this.deviceChanged();
        }, 400);
      }
    }

    if (this.notifyIsOpen) {
      this.notifyIsOpen = false;

      if (this.videoIsInView && this.firstRun) {
        _.delay(() => {
          this.playVideo(true);
          this.deviceChanged();
        }, 400);
      }
    }
  }

  onscreen(event, measurements) {
    const visible = this.model.get('_isVisible');
    const isOnscreenX = measurements.percentInviewHorizontal == 100;
    const isOnscreenY = (measurements.percentFromTop < 50) && (measurements.percentFromTop > -10);

    if (visible && isOnscreenX && isOnscreenY) {
      if (!this.notifyIsOpen && !this.audioPromptIsOpen) {
        this.playVideo(true);
      }
      this.videoIsInView = true;
    } else {
      this.playVideo(false);
      this.videoIsInView = false;
    }
  }

  playVideo(state) {
    this.deviceChanged();

    if (state) {
      this.video.play();
      this.firstRun = false;
    } else if (state === false) {
      this.video.pause();
    }
  }

  deviceChanged() {
    if (device.screenSize === 'small' && this.model.get('_background')._video._disableOnMobile) {
      this.$el.addClass('is-hidden');
    } else {
      this.$el.removeClass('is-hidden');
    }
  }
}
