(function (root, factory) {
	root['pipe'] = factory();
})(this, function () {

	let _is_preview = false;
	let _pagewidth = 750;
	let _ratio = 1;
	let _storage = null;

	function Storage(configuration) {
		this.__config = configuration;
		this.__listener = null;
		this.__monitor = null;

		this.all = function () {
			return this.__config || {};
		}
		this.get = function (key) {
			return this.__config[key];
		}
		this.check = function (key, externalButtons) {
			if ('buttons' === key) {
				const originButtons = this.get(key);
				if (Array.isArray(externalButtons) && Array.isArray(originButtons)) {
					// 遍历外部数据
					externalButtons.forEach(item => {
						const pickedBtn = originButtons.find(btn => item.image === btn.image);
						if (pickedBtn) {
							item.position = pickedBtn.position;
						}
					})
				}
			}
		}
		this.save = function (key, value, origin) {
			if (origin === 'configer') {
				this.check(key, value);
			}

			this.__config[key] = value;
			if (this.__listener && origin === 'drager') {
				console.log('internal change', key, value);
				this.__listener(key, value);
			}
			if (this.__monitor && origin === 'configer') {
				console.log('external chang', key, value);
				this.__monitor(key, value);
			}
		}
		// 配置平台监听
		this.listener = function (cb) {
			if (cb && typeof cb === 'function') {
				this.__listener = cb;
			}
		}
		// 拖拽平台监听
		this.monitor = function (cb) {
			if (cb && typeof cb === 'function') {
				this.__monitor = cb;
			}
		}
	}

	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	}

	function addScript(path) {
		// refrence to https://www.bennadel.com/blog/3454-jquery-s-append-methods-intercept-script-tag-insertion-and-circumvent-load-handlers.htm
		return new Promise((resolve, reject) => {
			var isExist = false;
			var scripts = $('script');
			for (var i = 0; i < scripts.length; i++) {
				var src = $(scripts[i]).attr('src');
				if (src == path) {
					isExist = true;
					break;
				}
			}
			if (!isExist) {
				var scriptElement = document.createElement("script");
				scriptElement.onload = function () {
					resolve();
				};
				scriptElement.setAttribute("type", "text/javascript");
				scriptElement.src = path;
				document.body.appendChild(scriptElement);
			} else {
				resolve();
			}
		})
	}

	function addCss(path) {
		return new Promise((resolve, reject) => {
			var isExist = false;
			var links = $('link');
			for (var i = 0; i < links.length; i++) {
				var src = $(links[i]).attr('href');
				if (src == path) {
					isExist = true;
					break;
				}
			}
			if (!isExist) {
				var scriptElement = document.createElement("link");
				scriptElement.onload = function () {
					resolve();
				};
				scriptElement.setAttribute("rel", "stylesheet");
				scriptElement.href = path;
				document.head.appendChild(scriptElement);
			} else {
				resolve();
			}
		})
	}

	function getPassportHtml(nodeEl) {

		// 缺省设置颜色
		if (!nodeEl.color) {
			const defaultColor = {
				labelColor: '#333333',
				inputColor: '#F9C1A4',
				inputBackgroundColor: 'rgba(0, 0, 0, 0.2)',
				verifyCodeLabelColor: '#F9C1A4',
				tipColor: '#C1C1C3'
			}
			nodeEl['color'] = defaultColor;
		}

		function renderPassport() {
			const passportHtml = `
				<div id="passport-mobile-code-container" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
					<div style="position: absolute; padding: ${10 * _ratio}px ${20 * _ratio}px ${20 * _ratio}px ${_ratio * 20}px;">
						<div style="padding: ${30 * _ratio}px 0px;">
							<span style="font-size: ${_ratio * 30}px; color: ${nodeEl.color.labelColor};">+86</span>
							<input id="mobile-number-id" type="text" placeholder="请输入手机号码"
								style="border-style: none; box-sizing: border-box; outline: none; background-color: ${nodeEl.color.inputBackgroundColor}; padding: ${10 * _ratio}px ${5 * _ratio}px; font-size: ${30 * _ratio}px; width: 85%; color: ${nodeEl.color.inputColor};" />
						</div>
						<div style="padding: ${30 * _ratio}px 0px;">
							<span style="font-size: ${28 * _ratio}px; color: ${nodeEl.color.labelColor};">验证码</span>
							<input id="mobile-verifycode-id" type="password" placeholder="请输入验证码"
								style="border-style: none; box-sizing: border-box; outline: none; background-color: rgba(0, 0, 0, 0.2); padding: ${10 * _ratio}px ${5 * _ratio}px; font-size: ${_ratio * 30}px; color: #333333;">
							<span id="btn-verifycode-id"
								style="color: ${nodeEl.color.verifyCodeLabelColor}; font-size: ${_ratio * 28}px; display: inline-block; padding: 0 ${_ratio * 10}px; text-align: center; cursor: pointer;">发送验证码</span>
						</div>
                        <div id="captcha-picture"></div>
						<div style="font-size: ${_ratio * 28}px; color: ${nodeEl.color.tipColor}; text-align: center; margin: ${_ratio * 35}px auto ${_ratio * 40}px auto;">
							未注册的手机号码验证后将自动创建东方财富账号</div>
						<div id="passport-login-container" style="text-align: center; height: ${_ratio * 80}px;">
							<img style="height: 100%;" src="${nodeEl.buttonImage}" alt="">
						</div>
					</div>
				</div>
			`;
			return $($.parseHTML(passportHtml));
		}

		const container = $('<div>', {
			id: 'passport-container',
			'data-index': nodeEl.__name
		}).css({
			width: '100%',
			minHeight: '300px',
			backgroundColor: '#FFF',
		});
		const imgProps = {
			src: nodeEl.backgroundImage,
			width: '100%'
		}
		const backgroundImage = $('<img>', imgProps).css({
			position: 'absolute'
		});
		backgroundImage[0].addEventListener('load', function () {
			const container = $('#passport-mobile-code-container');
			if (container && container.length) {
				container.remove();
			}
			const backgroundImageHeight = backgroundImage.height();
			const passport = renderPassport(backgroundImageHeight);
			passport.appendTo($('#passport-container').css({ height: backgroundImageHeight }));
		}, false);
		backgroundImage.appendTo(container);

		return container;
	}

	function createEl(el) {
		if (el && el.type === 'rule' && el.active) {
			const css = {
				top: el.position.top * _ratio + 'px',
				left: el.position.left * _ratio + 'px',
				position: 'absolute',
				zIndex: 10,
				cursor: 'pointer',
			};
			if (_is_preview && ['top', 'bottom'].indexOf(el.anchor) > -1) {
				css.position = 'fixed';
			} else {
				css.position = 'absolute';
			}

			const imgProps = {
				src: el.image,
			}
			const img = $('<img>', imgProps);
			img[0].addEventListener('load', function () {
				img.css({ width: img.width() * _ratio });
			}, false);
			const a = $('<a>', {
				id: 'the-rule-entry',
				'el-type': 'el-rule'
			}).css(css);
			if (!_is_preview && ['top', 'bottom'].indexOf(el.anchor) > -1) {
				// 生成大头针
				const pin = $('<div>').css({
					width: '16' * _ratio + 'px',
					height: '16' * _ratio + 'px',
					position: 'absolute',
					top: 0,
					right: 0,
					background: 'url(../../assets/activityAssets/img/fixed-pin.png) no-repeat 0 0',
					backgroundSize: `${16 * _ratio}px ${16 * _ratio}px`
				})
				pin.appendTo(a);
			}
			img.appendTo(a);
			return a;
		} else if (el && el.type && (el.type === 'content' || el.type === 'passport')) {
			if (el.type === 'content') {
				const props = {
					src: el.image
				}
				if (!_is_preview) {
					props['data-index'] = el.__name;
				}
				const img = $('<img>', props).css({
					width: '100%',
					cursor: 'grabbing',
					display: 'block'
				})
				return img;
			} else if (el.type === 'passport') {
				const passportHtml = getPassportHtml(el);
				return passportHtml;
			}
		} else if (el && el.type && el.type === 'button') {
			if (!el.image) {
				return;
			}
			const css = {
				cursor: 'pointer',
				position: 'absolute',
				zIndex: 11
			};
			const props = {};
			if (!_is_preview) {
				css.top = el.position.top * _ratio + 'px',
				css.left = el.position.left * _ratio + 'px'
				props.class = el.__name;
				props['el-type'] = 'el-button';
				if (['top', 'bottom'].indexOf(el.anchor) > -1) {
					if ('top' === el.anchor) {
						css.top = el.position.top * _ratio + 'px';
						css.left = el.position.left * _ratio + 'px';
					} else if ('bottom' === el.anchor) {
						css.bottom = el.position.bottom * _ratio + 'px';
						css.left = el.position.left * _ratio + 'px'
					}
				}
			} else {
				if (el.anchor === 'top') {
					css.position = 'fixed';
					css.top = el.position.top * _ratio + 'px';
					css.left = el.position.left * _ratio + 'px';
				} else if (el.anchor === 'bottom') {
					css.position = 'fixed';
					css.bottom = el.position.bottom * _ratio + 'px';
					css.left = el.position.left * _ratio + 'px'
				} else {
					css.top = el.position.top * _ratio + 'px',
						css.left = el.position.left * _ratio + 'px'
				}
			}
			props.id = el.__name;
			const a = $('<a>', props).css(css);
			const buttonProps = {
				src: el.image,
			};
			const button = $('<img>', buttonProps);
			button[0].addEventListener('load', function () {
				button.css({ width: button.width() * _ratio })
			}, false)
			button.appendTo(a);
			if (!_is_preview && ['top', 'bottom'].indexOf(el.anchor) > -1) {
				// 生成大头针
				const pin = $('<div>').css({
					width: '16' * _ratio + 'px',
					height: '16' * _ratio + 'px',
					position: 'absolute',
					top: 0,
					right: 0,
					background: 'url(../../assets/activityAssets/img/fixed-pin.png) no-repeat 0 0',
					backgroundSize: `${16 * _ratio}px ${16 * _ratio}px`
				})
				pin.appendTo(a);
			}
			return a;
		} else if (el && el.type && el.type === 'top-banner') {
			const shareKey = getQueryString('share');
			if (!_is_preview || shareKey === '1') {
				const css = {};
				if (el.action) {
					css.cursor = 'pointer';
				}
				const img = $('<img>', {
					src: el.image,
					class: 'swiper-slide',
					id: el.__name
				}).css(css);
				img[0].addEventListener('load', function () {
					topBannerViewCorrect();
				}, false);
				return img;
			}
		} else if (el && el.type && el.type === 'bottom-banner') {
			const css = {};
			if (el.action) {
				css.cursor = 'pointer';
			}
			const img = $('<img>', {
				src: el.image,
				class: 'swiper-slide',
				id: el.__name
			}).css(css);
			img[0].addEventListener('load', function () {
				bottomBannerViewCorrect();
			}, false);
			return img;
		}
	}

	// 由配置对象生成页面
	function renderNode(_key, obj) {
		if (_key === 'title') {
			document.title = obj;
		} else if (_key === 'rule') {
			const theRules = $('#the-rule');
			if (theRules && theRules.length) {
				theRules.empty();
			} else {
				$('<div>', {
					id: 'the-rule'
				}).appendTo('#the-current-page');
			}
			obj.type = 'rule';
			const el = createEl(obj);
			if (el) {
				el.appendTo('#the-rule');
			}
		} else if (_key === 'contents') {
			const theContents = $('#the-contents');
			if (theContents && theContents.length) {
				theContents.empty();
			} else {
				$('<div>', {
					id: 'the-contents',
				}).appendTo('#the-current-page');
			}
			for (let k in obj) {
				const node = obj[k];
				node.__name = k;
				const el = createEl(node);
				delete node.__name;
				if (el) {
					el.appendTo('#the-contents');
				}
			}
		} else if (_key === 'buttons') {
			const theButtons = $('#the-buttons');
			if (theButtons && theButtons.length) {
				theButtons.empty();
			} else {
				$('<div>', {
					id: 'the-buttons'
				}).appendTo('#the-current-page');
			}
			for (let k in obj) {
				const node = obj[k];
				node.__name = 'btn__' + k;
				const el = createEl(node);
				delete node.__name;
				if (el) {
					el.appendTo('#the-buttons');
				}
			}
		} else if (_key === 'topBanner') {
			$('#the-top-banners').remove();
			if (obj && obj.length) {
				const css = {
					top: 0,
					left: 0,
					width: _pagewidth + 'px'
				}
				if (_is_preview) {
					css.position = 'fixed';
				} else {
					css.position = 'absolute';
				}
				$('<div>', {
					id: 'the-top-banners',
					class: 'swiper-container'
				}).css(css).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-top-banner-wrapper',
					class: 'swiper-wrapper'
				}).appendTo('#the-top-banners');
			}
			for (let k in obj) {
				const target = obj[k];
				target.type = 'top-banner';
				target.__name = 'topBanner-' + k;
				const el = createEl(target);
				delete target.__name;
				if (el) {
					el.appendTo('#the-top-banner-wrapper');
				}
			}
		} else if (_key === 'bottomBanner') {
			$('#the-bottom-banners').remove();
			if (obj && obj.length) {
				const css = {
					bottom: 0,
					left: 0,
					width: _pagewidth + 'px'
				}
				if (_is_preview) {
					css.position = 'fixed';
				} else {
					css.position = 'absolute';
				}
				$('<div>', {
					id: 'the-bottom-banners',
					class: 'swiper-container'
				}).css(css).appendTo('#the-current-page');
				$('<div>', {
					id: 'the-bottom-banner-wrapper',
					class: 'swiper-wrapper'
				}).appendTo('#the-bottom-banners');
				for (let i = 0; i < obj.length; i++) {
					const target = obj[i];
					target.type = 'bottom-banner';
					target.__name = 'bottomBanner-' + i;
					const el = createEl(target);
					delete target.__name;
					if (el) {
						el.appendTo('#the-bottom-banner-wrapper');
					}
				}
			}
		}
	}

	function setViewPort() {
		let viewport = document.querySelector("meta[name=viewport]");
		viewport.setAttribute('content', `width=${_pagewidth || 750}, initial-scale=1.0`);
	}

	function setTopContainer() {
		$('#the-current-page').css({
			width: _pagewidth + 'px'
		})
	}

	function render(pagewidth) {
		const configuration = _storage.all();
		_pagewidth = pagewidth;
		_ratio = _pagewidth / (configuration.pagewidth || 750); // 确定页面布局比率
		setViewPort();
		setTopContainer();

		for (let k in configuration) {
			renderNode(k, configuration[k])
		}
	}
	// render(_config, false);

	function setupSwiper() {
		// 需要先判断是否topBanners是否存在，且数据大于1
		if (_storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			const options = {
				autoplay: true,
			};
			if (_storage.get('topBanner').length > 1) {
				options.loop = true;
			}
			new Swiper('#the-top-banners', options);
		}
		// 需要先判断是否bottomBanners是否存在，且数据大于1
		if (_storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner').length) {
			const options = {
				autoplay: true,
			};
			if (_storage.get('bottomBanner').length > 1) {
				options.loop = true;
			}
			new Swiper('#the-bottom-banners', options);
		}
	}

	function buttonsDisplace() {
		const displace = window.displacejs;
		const displaceElements = [];
		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length) {
			const btns = _storage.get('buttons');
			for (let i = 0; i < btns.length; i++) {
				const btn = btns[i];
				if (btn && btn.image) {
					displaceElements.push('.btn__' + i);
				}
			}
		}
		if (_storage && _storage.all() && _storage.get('rule') && _storage.get('rule')['active']) {
			displaceElements.push('#the-rule-entry');
		}
		displaceElements.map(cls => {
			const el = document.querySelector(cls);
			displace(el, {
				onMouseUp: function () {
					const elType = $(el).attr('el-type');
					// 定位矫正
					if (el.offsetLeft < 0) {
						$(el).css({ left: 0 })
					} else if (el.offsetLeft + $(el).width() > _pagewidth) {
						$(el).css({ left: _pagewidth - el.clientWidth })
					}
					if (elType === 'el-button') {
						if (_storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
							const topHeight = $('#the-top-banners').height();
							if (el.offsetTop < topHeight) {
								$(el).css({
									top: topHeight
								})
							}
						}
						if (_storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
							const bottomHeight = $('#the-bottom-banners').height();
							const contentHeight = $('#the-current-page').height();
							const maxOffsetTop = contentHeight - bottomHeight - el.clientHeight;
							if (el.offsetTop > maxOffsetTop) {
								$(el).css({
									top: maxOffsetTop
								})
							}
						}

						const clsList = el.className.split(' ');
						const findCls = clsList.find(item => item.indexOf('btn__') > -1);
						if (findCls) {
							const tempList = findCls.split('__');
							const btnIndex = tempList[tempList.length - 1];

							const btn = _storage.get('buttons')[btnIndex];
							if (btn.anchor === 'bottom') {
								const offsetBottom = $('#the-current-page').height() - $(el)[0].offsetTop - $(el).children('img').height();
								$(el).css({
									bottom: offsetBottom
								})
								btn.position = {
									bottom: offsetBottom / _ratio,
									left: el.offsetLeft / _ratio
								}
							} else {
								btn.position = {
									top: el.offsetTop / _ratio,
									left: el.offsetLeft / _ratio
								}
							}
							pageEmit('buttons', _storage.get('buttons'));
						}
					} else if (elType === 'el-rule') {
						if (el.offsetTop < 0) {
							$(el).css({ top: 0 })
						}
						const contentHeight = $('#the-current-page').height();
						const maxOffsetTop = contentHeight - el.clientHeight;
						if (el.offsetTop > maxOffsetTop) {
							$(el).css({
								top: maxOffsetTop
							})
						}
						const rule = _storage.get('rule');
						rule.position = {
							top: el.offsetTop / _ratio,
							left: el.offsetLeft / _ratio
						}
						pageEmit('rule', rule);
					}
				}
			})
		});
	}
	function contentsDisplace() {
		const dragulable = window.dragula;
		const drake = dragulable([document.querySelector('#the-contents')], {
			moves: function (el, source, handle, sibling) {
				return true; // elements are always draggable by default
			},
			accepts: function (el, target, source, sibling) {
				return true; // elements can be dropped in any of the `containers` by default
			},
			release: function (e) {
				// 监听鼠标谈起mouseup事件
				if (_storage.all() && _storage.get('contents') && _storage.get('contents').length) {
					const newContents = [];
					const contents = $('#the-contents').children();
					let isSame = true;
					const oldContents = _storage.get('contents');
					for (let i = 0; i < contents.length; i++) {
						const imgIndex = $(contents[i]).attr('data-index');
						$(contents[i]).attr('data-index', i);
						newContents.push(oldContents[imgIndex]);

						if (oldContents[i].image !== oldContents[imgIndex].image) {
							isSame = false;
						}
					}
					// 对比原有数据
					if (!isSame) {
						pageEmit('contents', newContents);
					}
				}
			}
		});
	}

	$(document).ready(function () {
		// setupSwiper();
	})

	function topBannerViewCorrect() {
		// 视图矫正
		// 1. 计算top banner和bottom banner的高度
		if (_storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			const topHeight = $('#the-top-banners').height();
			$('#the-contents').css({
				'margin-top': topHeight
			})
		}
	}

	function bottomBannerViewCorrect() {
		// 1. 计算top banner和bottom banner的高度
		if (_storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
			const bottomHeight = $('#the-bottom-banners').height();
			$('#the-contents').css({
				'margin-bottom': bottomHeight
			})
		}
	}

	// 拖拽平台修改通知到配置平台
	function pageEmit(key, obj) {
		// 利用json stringify进行深拷贝 - 场景是由于config对象来源于json字符串
		const copyObj = JSON.parse(JSON.stringify(obj));
		_storage.save(key, copyObj, 'drager');
	}


	// 初始化storage
	const factory = {};

	function init(config, isPreview) {
		_is_preview = isPreview;
		// 配置平台
		if (!_is_preview) {
			Promise.all(
				[
					// addCss('../../assets/activityAssets/libs/swiper/swiper.css'),
					// addScript('../../assets/activityAssets/libs/swiper/swiper.js'),
					// addCss('../../assets/activityassets/css/dragula.css'),
					// addScript('../../assets/activityassets/js/dragula.js'),
					// addScript('../../assets/activityassets/js/displace.js')

					addCss('./src/libs/swiper/swiper.css'),
					addScript('./src/libs/swiper/swiper.js'),
					addCss('./src/css/dragula.css'),
					addScript('./src/js/dragula.js'),
					addScript('./src/js/displace.js')
				]
			).then(_ => {
				setupSwiper();
				contentsDisplace();
				buttonsDisplace();
				// 监听配置平台的数据发生了改变，配置平台通过对storage对象的save(key, value)方法进行变更数据
				_storage.monitor(function (key, value) {
					renderNode(key, value);
					if (key === 'buttons' || key === 'rule') {
						buttonsDisplace();
					} else if (key === 'topBanner' || key === 'bottomBanner') {
						setupSwiper();
					}
				})
			});
		} else {
			Promise.all(
				[
					// addCss('../../assets/activityAssets/libs/swiper/swiper.css'),
					// addScript('../../assets/activityAssets/libs/swiper/swiper.js'),

					addCss('./src/libs/swiper/swiper.css'),
					addScript('./src/libs/swiper/swiper.js'),
				]
			).then(_ => {
				setupSwiper();
			});
		}
		_storage = new Storage(config);
		factory['storage'] = _storage;
	}

	function toast(msg, cb) {
		const toastContainer = $('<div>', {
			id: 'toast-container-dc'
		}).css({
			position: 'fixed',
			top: 0,
			left: 0,
			width: _pagewidth,
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		});
		const toast = $('<div>').css({
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			padding: 30 * _ratio + 'px',
			color: '#ffffff',
			marginLeft: 40 * _ratio + 'px',
			marginRight: 40 * _ratio + 'px',
			textAlign: 'center',
			lineHeight: '1.5',
			fontSize: 30 * _ratio + 'px',
			borderRadius: 5 * _ratio + 'px'
		}).text(msg);
		toast.appendTo(toastContainer);
		toastContainer.appendTo('#the-current-page');

		const timer = setTimeout(function () {
			$('#toast-container-dc').remove();
			if (cb && typeof cb === 'function') {
				cb()
			}
			clearTimeout(timer);
		}, 2000)
	}

	factory['renderDom'] = render;
	factory['init'] = init;
	factory['layer'] = {
		toast: toast
	};

	return factory;
});