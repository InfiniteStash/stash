import VideoJS, { VideoJsPlayer } from 'video.js';

const MenuItem = VideoJS.getComponent('MenuItem');
const MenuButton = VideoJS.getComponent('MenuButton');

class QualityLevelsItem extends MenuItem {
  constructor(player: VideoJsPlayer, options?: VideoJS.MenuItemOptions) {
    super(player, options);
    this.selectable = true;
    this.update();
  }

  handleClick() {
    const sourceManager = this.player().sourceManager();

    // qualityLevels.selectedIndex_ = this.options_.index;
    sourceManager.setSrc(this.options_.url);

    // this.options_.controller.triggerItemUpdate();
  }

  update() {
    /*
    const qualityLevels = this.player().sourceManager();
    this.selected(this.options_.index == qualityLevels.selectedIndex);
    */
  }
}


class QualityLevelsMenu extends MenuButton {
  createEl() {
    return VideoJS.dom.createEl('div', {
      className: 'vjs-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button',
    });
  }

  buildCSSClass() {
    return `${MenuButton.prototype.buildCSSClass.call(this)} vjs-icon-cog`;
  }

  triggerItemUpdate() {
    this.menuItems.forEach(item => item.update());
  }

  createItems() {
    const levels = this.player().sourceManager().sources;
    this.menuItems = [];

    for(let i = 0; i < levels.length; i++) {
      this.menuItems.push(new QualityLevelsItem(this.player_, {
        controller: this,
        label: levels[i].label ?? '',
        url: levels[i].url,
      }));
    }

    return this.menuItems;
  }
}

type Source = {
  url: string;
  label?: string | undefined | null;
  mime_type?: string | undefined | null;
}

class SourceManagerPlugin extends VideoJS.getPlugin('plugin') {
  sources: Source[];
  selectedIndex: number;
  poster?: string;
  menu?: QualityLevelsMenu;

  constructor(player: VideoJsPlayer) {
    super(player);
    this.sources = [];
    this.selectedIndex = -1;

    this.player.on('loadedmetadata ', () => {
      if (
        !this.player.videoWidth &&
        !this.player.videoHeight
      ) {
        // Occurs during preload when videos with supported audio/unsupported video are preloaded.
        // Treat this as a decoding error and try the next source without playing.
        // However on Safari we get an media event when m3u8 is loaded which needs to be ignored.
        const currentFile = this.player.currentSrc()
        if (currentFile != null && !currentFile.includes("m3u8")) {
          this.handleError(!this.player.paused());
        }
      }
    });

    this.player.on('canplay', () => {
      this.menu?.triggerItemUpdate();
    });
  }

  handleError(play: boolean) {
    let currentFile = this.player.currentSrc()
    currentFile = currentFile.replace(/\??\&?start=\d+/, '');
    if (currentFile) {
      // eslint-disable-next-line no-console
      console.log(`Source failed: ${currentFile}`);
    }

    console.log(this.sources);
    if (this.removeSource(currentFile)) {
      if (play) {
        this.player.sourceManager().play();
      }
    } else {
      this.player.pause();
    }
    console.log(this.sources);
  }

  removeSource(src: string) {
    const sources = this.sources.filter(s => s.url !== src);
    this.sources = sources;
    this.player.src(this.sources.map(s => ({
      src: s.url,
      type: s.mime_type ?? undefined,
    })));
    return sources.length > 0;
  }

  setSources(sources: Source[], poster?: string | null) {
    this.sources = sources;
    this.poster = poster ?? undefined;
    console.log(new Date());

    this.player.src(sources.map(s => ({
      src: s.url,
      type: s.mime_type ?? undefined,
    })));

    this.menu?.dispose();
    this.menu = new QualityLevelsMenu(this.player);

    this.player.controlBar.addChild(this.menu, {}, 20);

  }

  play() {
    console.log(`playing ${this.player.src()}`);
    console.log(new Date());
    this.player.play()?.catch(() => {
      console.log("Autoplay not allowed");
    });
  }

  showPoster() {
    if (this.poster)
      this.player.poster(this.poster);
    else
      this.hidePoster();
  }

  hidePoster() {
    this.player.poster("");
  }

  setSrc(url: string) {
    this.player.src(url);
    this.play();
  }
}

VideoJS.registerComponent('QualityLevelsItem', QualityLevelsItem);
VideoJS.registerComponent('QualityLevelsMenu', QualityLevelsMenu);
VideoJS.registerPlugin('sourceManager', SourceManagerPlugin);

declare module 'video.js' {
    interface VideoJsPlayer {
        sourceManager: () => SourceManagerPlugin;
    }
}
