(function(root, factory) {
	root['pipe'] = factory();
})(this, function() {

	let _is_preview = false;
	let _pagewidth = 750;
	let _ratio = 1;
	let _storage = null;

	function Storage(configuration) {
		this.__config = configuration;
		this.__listener = null;
		this.__monitor = null;

		this.all = function() {
			return this.__config || {};
		}
		this.get = function(key) {
			return this.__config[key];
		}
		this.save = function(key, value, origin) {
			this.__config[key] = value;

			if (this.__listener && origin === 'drager') {
				this.__listener(key, value);
			}
			if (this.__monitor && origin === 'configer') {
				this.__monitor(key, value);
			}
		}
		// 配置平台监听
		this.listener = function(cb) {
			if (cb && typeof cb === 'function') {
				this.__listener = cb;
			}
		}
		// 拖拽平台监听
		this.monitor = function(cb) {
			if (cb && typeof cb === 'function') {
				this.__monitor = cb;
			}
		}
	}
	
	function addScript(path) {
		$('<script>', {
			src: path
		}).appendTo('body');
	}

	function addCss(path) {
		$('<link>', {
			rel: 'stylesheet',
			href: path
		}).appendTo('head');
	}

	function postPassport(loginName, verifyCode) {
		// 进行ajax请求
		return new Promise((resolve, reject) => {
			if (!loginName || !verifyCode) {
				alert('未输入电话号码或验证码')
				reject();
				return;
			}
			resolve();
		})
	}

	function renderPassport(target, nodeEl) {
		let htmlTemplate = `
			<div style="position: fixed; top: 0; left: 0; width: ${_pagewidth}px; height: 100%; z-index: 100; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center;">
				<div style="position: absolute; top: ${_ratio * 200}px; background-color: #F8F9FB; padding: ${_ratio * 10}px ${_ratio * 20}px ${_ratio * 20}px ${_ratio * 20}px;">
					<div style="border-bottom: solid 1px #F4F5F7; padding: ${_ratio * 30}px 0px;">
						<span style="font-size: ${_ratio * 30}px; color: #333333;">+86</span>
						<input id="mobile-number-id" type="text" placeholder="请输入手机号码" style="border-style: none; box-sizing: border-box; outline: none; background-color: #F8F9FB; padding: ${_ratio * 10}px 5px; font-size: ${_ratio * 30}px; width: 85%; color: #333333;" />
					</div>
					<div style="border-bottom: solid 1px #F4F5F7; padding: ${_ratio * 30}px 0px;">
						<span style="font-size: ${_ratio * 28}px; color: #333333;">验证码</span>
						<input id="mobile-verifycode-id" type="password" placeholder="请输入验证码" style="border-style: none; box-sizing: border-box; outline: none; background-color: #F8F9FB; padding: ${_ratio * 10}px ${_ratio * 5}px; border-right: solid 1px #F4F5F7; font-size: ${_ratio * 30}px; color: #333333;">
						<span id="btn-verifycode-id" style="color: #F9C1A4; font-size: ${_ratio * 28}px; display: inline-block; padding: 0 ${_ratio * 10}px; text-align: center; cursor: pointer;">发送验证码</span>
					</div>
					<div style="font-size: ${_ratio * 28}px; color: #C1C1C3; text-align: center; margin: ${_ratio * 35}px auto ${_ratio * 40}px auto;">未注册的手机号码验证后将自动创建东方财富账号</div>
					<div id="passport-login-container" style="text-align: center;">
					</div>
				</div>
			</div>
		`;
		$($.parseHTML(htmlTemplate)).appendTo('#the-current-page');

		// 验证码获取
		$(document).on('click', '#btn-verifycode-id', function() {
			alert('获取验证码');
		});

		const passport = _storage.get('passport');
		if (passport && passport.image) {
			$('<img>', {
				src: passport.image,
				click: () => {
					const loginMobile = $('#mobile-number-id').val();
					const loginVerifyCode = $('#mobile-verifycode-id').val();
					postPassport(loginMobile, loginVerifyCode).then(res => {
						if (target === 'web') {
							window.location.href = nodeEl.url;
						} else if (target === 'app') {
							window.location.href = `sechem.url?url=${nodeEl.url}`;
						}
					}).catch(err => {})
				}
			}).appendTo('#passport-login-container');
		} else {
			const defualtLoginBtn = `<div id="passport-default-login" style="color: #ffffff; background-color: #FFA17C; border-radius: 5px; text-align: center; font-size: ${_ratio * 30}px; height: ${_ratio * 80}px; line-height: ${80 * _ratio}px; cursor: pointer;">登录</div>`; 
			$($.parseHTML(defualtLoginBtn)).appendTo('#passport-login-container');

			$(document).on('click', '#passport-default-login', function() {
				const loginMobile = $('#mobile-number-id').val();
				const loginVerifyCode = $('#mobile-verifycode-id').val();
				postPassport(loginMobile, loginVerifyCode).then(res => {
					if (target === 'web') {
						window.location.href = nodeEl.url;
					} else if (target === 'app') {
						window.location.href = `sechem.url?url=${nodeEl.url}`;
					}
				}).catch(err => {})
			})
		}
	}

	function createEl(el) {
		if (el && el.active) {
			const css = {
				top: 0,
				right: 20,
				position: 'absolute',
				zIndex: 10,
				width: 42
			};
			if (_is_preview) {
				css.position = 'fixed';
			} else {
				css.position = 'absolute';
			}
			const img = $('<img>', {
				src: el.image,
				click: () => {
					alert('跳转到规则页面');
				}
			}).css(css)
			return img;
		} else if (el && el.type && el.type === 'img') {
			const props = {
				src: el.image
			}
			if (!_is_preview) {
				props['data-index'] = el.__name;
			}
			const img = $('<img>', props).css({
				width: '100%',
				cursor: 'grabbing'
			})
			return img;
		} else if (el && el.type && el.type === 'button') {
			const css = {
				cursor: 'pointer',
				position: 'absolute',
				top: el.position.top * _ratio + 'px',
				left: el.position.left * _ratio + 'px'
			};
			const props = {};
			if (_is_preview) {
				props.click = () => {
					// 四种组合
					if (el.target === 'web' && el.action === 'href') {
						// 直接跳转
						window.location.href = el.url;
					} else if (el.target === 'web' && el.action === 'passport') {
						// 登录信息收集框后进行跳转
						renderPassport('web', el);
					} else if (el.target === 'app' && el.action === 'href') {
						// 在app中打开相应的url地址 -- 在target为app时候，需要提供download url
					} else if (el.target === 'app' && el.action === 'passport') {
						// 登录信息收集页面点击登录后 -- 打开app并进行再app中打开相应的页面
						renderPassport('app', el);
					}
				}
			} else {
				props.class = el.__name
			}
			const a = $('<a>', props).css(css);
			const button = $('<img>', { src: el.image });
			button.appendTo(a);
			return a;
		} else if (el && el.type && el.type === 'top-banner') {
			const css = {};
			if (el.action) {
				css.cursor = 'pointer';
			}
			const img = $('<img>', {
				src: el.image,
				class: 'swiper-slide'
			}).css(css);
			return img;
		} else if (el && el.type && el.type === 'bottom-banner') {
			const css = {};
			if (el.action) {
				css.cursor = 'pointer';
			}
			const img = $('<img>', {
				src: el.image,
				class: 'swiper-slide'
			}).css(css);
			return img;
		}
	}

	// 由配置对象生成页面
	function renderNode(_key, obj) {
		if (_key === 'title') {
			document.title = obj;
		} else if (_key === 'rule') {
			$('#the-rule').empty();
			$('<div>', {
				id: 'the-rule'
			}).appendTo('#the-current-page');
			const el = createEl(obj);
			el.appendTo('#the-rule');
		} else if (_key === 'share') {
			
		} else if (_key === 'contents') {
	 		$('#the-contents').empty();
			$('<div>', {
				id: 'the-contents',
			}).appendTo('#the-current-page');
			for (let k in obj) {
				const node = obj[k];
				node.__name = k; 
				const el = createEl(node);
				delete node.__name;
				el.appendTo('#the-contents');
			}
		} else if (_key === 'buttons') {
			$('#the-buttons').empty();
			$('<div>', {
				id: 'the-buttons'
			}).appendTo('#the-current-page');
			for (let k in obj) {
				const node = obj[k];
				node.__name = 'btn__' + k; 
				const el = createEl(node);
				delete node.__name;
				el.appendTo('#the-buttons');
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
				const el = createEl(target);
				el.appendTo('#the-top-banner-wrapper');
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
					const el = createEl(target);
					el.appendTo('#the-bottom-banner-wrapper');
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

	function render(pagewidth, isPreview) {
		const configuration = _storage.all();
		_is_preview = isPreview;
		_pagewidth = pagewidth;
		_ratio = _pagewidth / (configuration.pagewidth || 750); // 确定页面布局比率
		setViewPort();
		setTopContainer();

		if (configuration.hasOwnProperty('topBanner') || configuration.hasOwnProperty('bottomBanner')) {
			addScript('./src/libs/swiper/swiper.animate1.0.3.min.js');
			addScript('./src/libs/swiper/swiper.js');
			addCss('./src/libs/swiper/animate.min.css');
			addCss('./src/libs/swiper/swiper.css');

			setupSwiper();
		}

		// 配置平台
		if (!_is_preview) {
			addScript('./src/js/dragula.js');
			addScript('./src/js/displace.js');
		}
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


	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	}

	function buttonsDisplace() {
		const displace = window.displacejs;
		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length) {
			const btns = [];
			for (let i = 0; i < _storage.get('buttons').length; i++) {
				btns.push('.btn__' + i);
			}
			btns.map(cls => {
				const el = document.querySelector(cls);
				displace(el, {
					onMouseDown: function () {
						// console.log(el.offsetLeft, el.offsetTop);
					},
					onMouseUp: function () {
						// 定位矫正
						if ($(el).offset().left < 0) {
							$(el).css({
								left: 0
							})
						} else if ($(el).offset().left + $(el).width() > _pagewidth) {
							$(el).css({
								left: _pagewidth - el.clientWidth
							})
						}
						if (_storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
							const topHeight = $('#the-top-banners').height();
							if ($(el).offset().top < topHeight) {
								$(el).css({
									top: topHeight
								})	
							}
						}
						if (_storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
							const bottomHeight = $('#the-bottom-banners').height();
							const contentHeight = $('#the-current-page').height();
							const maxOffsetTop = contentHeight - bottomHeight - el.clientHeight;
							if ($(el).offset().top > maxOffsetTop) {
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
							btn.position = {
								top: el.offsetTop,
								left: el.offsetLeft
							}
							pageEmit('buttons', _storage.get('buttons'));
						}
					}
				})
			});
		}
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
			release: function(e) { 
				// 监听鼠标谈起mouseup事件
				if (_storage.all() && _storage.get('contents') && _storage.get('contents').length) {
					const newContents = [];
					const contents = $('#the-contents').children('img');
					let isSame = true;
					for (let i = 0; i < contents.length; i++) {
						const imgIndex = $(contents[i]).attr('data-index');
						newContents.push(_storage.get('contents')[imgIndex]);

						if (_storage.get('contents')[i].image !== _storage.get('contents')[imgIndex].image) {
							isSame = false;
						}
					}
					// 对比原有数据
					if (!isSame) {
						pageEmit('contents', newContents);
						renderNode('contents', newContents); // 更新element img标签的data-index属性
					}
				}
			}
		});
	}

	$(document).ready(function() {
		// setupSwiper();
	})

	window.onload = function() {
		// 视图矫正
		// 1. 计算top banner和bottom banner的高度
		if (_storage && _storage.all() && _storage.get('topBanner') && _storage.get('topBanner').length) {
			const topHeight = $('#the-top-banners').height();
			$('#the-contents').css({
				'margin-top': topHeight
			})
		}
		if (_storage && _storage.all() && _storage.get('bottomBanner') && _storage.get('bottomBanner')) {
			const bottomHeight = $('#the-bottom-banners').height();
			$('#the-contents').css({
				'margin-bottom': bottomHeight
			})
		}
		// 计算出按钮图片适配后的长宽
		if (_storage && _storage.all() && _storage.get('buttons') && _storage.get('buttons').length) {
			const buttons = $('#the-buttons').children();
			for (let i = 0; i < buttons.length; i++) {
				const btnWidth = $($(buttons[i]).children()[0]).width();
				$($(buttons[i]).children()[0]).css({
					width: btnWidth * _ratio
				})
			}
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

	function init(config) {
		_storage = new Storage(config);
		factory['storage'] = _storage;
		// 监听配置平台的数据发生了改变，配置平台通过对storage对象的save(key, value)方法进行变更数据
		_storage.monitor(function (key, value) {
			renderNode(key, value);
		})
	}
	factory['renderDom'] = render;
	factory['init'] = init;

	return factory;
});