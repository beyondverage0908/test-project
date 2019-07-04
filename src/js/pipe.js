(function(root, factory) {
	root['pipe'] = factory();
})(this, function() {

	const _config = {
		activeRule: true,
		contents: [
			{
				type: 'img',
				image: 'http://img95.699pic.com/photo/50055/5642.jpg_wh300.jpg'
			},
			{
				type: 'img',
				image: 'https://cdn.pixabay.com/photo/2019/06/25/07/02/light-bulb-4297600__340.jpg'
			},
			{
				type: 'img',
				image: 'http://static.runoob.com/images/demo/demo4.jpg'
			},
			{
				type: 'img',
				image: 'http://static.runoob.com/images/demo/demo4.jpg'
			},
			{
				type: 'img',
				image: 'http://static.runoob.com/images/demo/demo4.jpg'
			}
		],
		buttons: [
			{
				type: 'button',
				action: 'app', // app, href
				url: 'url://secheme://url:xxx',
				image: 'http://127.0.0.1:9000/src/img/rank.png',
				width: '',
				height: '',
				position: {
					top: '300',
					left: '400'
				}
			},
			{
				type: 'button',
				action: 'href',
				url: 'http://www.baidu.com',
				image: 'http://127.0.0.1:9000/src/img/rank.png',
				width: '',
				height: '',
				position: {
					top: '400',
					left: '0',
				}
			},
			{
				type: 'button',
				action: 'passport',
				url: '',
				image: '',
				width: '',
				height: '',
				position: {
					top: '200',
					left: '300',
				}
			}
		],
		topBanner: [
			{
				image: 'http://choicewechatreport.eastmoney.com/static/img/header.a659903.png',
				url: 'http://choice.eastmoney.com/Mobile/Register/?uid=9986014488792464&returnUrl=/activity/register/m/success.html',
				action: 'href', // app, href, passport
			},
			{
				image: 'http://183.136.162.242/fileupload/WeChatV/9986014488792464.png',
				url: 'http://choice.eastmoney.com/Mobile/Register/?uid=9986014488792464&returnUrl=/activity/register/m/success.html',
				action: 'app', // app, href, passport
			}
		],
		bottomBanner: [
			{
				image: 'http://choicewechatreport.eastmoney.com/static/img/header.a659903.png',
				url: 'http://choice.eastmoney.com/Mobile/Register/?uid=9986014488792464&returnUrl=/activity/register/m/success.html',
				action: 'href', // app, href, passport
			},
			{
				image: 'http://183.136.162.242/fileupload/WeChatV/9986014488792464.png',
				url: 'http://choice.eastmoney.com/Mobile/Register/?uid=9986014488792464&returnUrl=/activity/register/m/success.html',
				action: 'app', // app, href, passport
			}
		],
	};


	let _callback_monitor = null;
	let _is_preview = false;

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

	function createEl(el) {
		if (el && el.type && el.type === 'img') {
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
				top: el.position.top + 'px',
				left: el.position.left + 'px'
			};
			const props = {
				src: el.image
			};
			if (_is_preview) {
				props.click = () => {
					if (el.action === 'app') {
						alert(el.url);
					} else if (el.action === 'href') {
						alert('href');
						window.location.href = el.url;
					} else if (el.action === 'passport') {
						alert('passport');
					}
				}
			} else {
				props.class = el.__name
			}
			const button = $('<img>', props).css(css)
			return button;
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
		if (_key === 'activeRule') {
			if (obj === true) {
				
			}
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
				$('<div>', {
					id: 'the-top-banners',
					class: 'swiper-container'
				}).css({
					position: 'fixed',
					top: 0,
					left: 0,
					width: '750px'
				}).appendTo('#the-current-page');
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
				$('<div>', {
					id: 'the-bottom-banners',
					class: 'swiper-container'
				}).css({
					position: 'fixed',
					bottom: 0,
					left: 0,
					width: '750px'
				}).appendTo('#the-current-page');
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

	function render(config, isPreview) {
		_is_preview = isPreview;

		if (config.hasOwnProperty('topBanner') || config.hasOwnProperty('bottomBanner')) {
			addScript('./src/libs/swiper/swiper.animate1.0.3.min.js');
			addScript('./src/libs/swiper/swiper.js');
			addCss('./src/libs/swiper/animate.min.css');
			addCss('./src/libs/swiper/swiper.css');
		}

		// 配置平台
		if (!_is_preview) {
			addScript('./src/js/dragula.js');
			addScript('./src/js/displace.js');
		}
		for (let k in config) {
			renderNode(k, config[k])
		}
	}
	render(_config, false);

	function setupSwiper() {
		// 需要先判断是否topBanners是否存在，且数据大于1
		if (_config && _config['topBanner'] && _config['topBanner'].length) {
			new Swiper('#the-top-banners', {
				autoplay: true,
				loop: true
			})
		}
		// 需要先判断是否bottomBanners是否存在，且数据大于1
		if (_config && _config['bottomBanner'] && _config['bottomBanner']) {
			new Swiper('#the-bottom-banners', {
				autoplay: true,
				loop: true
			})
		}
	}

	function buttonsDisplace() {
		const displace = window.displacejs;
		if (_config && _config['buttons'] && _config['buttons'].length) {
			const btns = [];
			for (let i = 0; i < _config['buttons'].length; i++) {
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
						if (el.offsetLeft < 0) {
							$(el).css({
								left: 0
							})
						} else if (el.offsetLeft + el.clientWidth > 750) {
							$(el).css({
								left: 750 - el.clientWidth
							})
						}
						if (_config && _config['topBanner'] && _config['topBanner']) {
							const topHeight = $('#the-top-banners').height();
							if (el.offsetTop < topHeight) {
								$(el).css({
									top: topHeight
								})	
							}
						}
						if (_config && _config['bottomBanner'] && _config['bottomBanner']) {
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

							const btn = _config.buttons[btnIndex];
							btn.position = {
								top: el.offsetTop,
								left: el.offsetLeft
							}
							pipe.pageEmit('buttons', _config['buttons']);
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
				if (_config && _config['contents'] && _config['contents'].length) {
					const newContents = [];
					const contents = $('#the-contents').children('img');
					for (let i = 0; i < contents.length; i++) {
						const imgIndex = $(contents[i]).attr('data-index');
						newContents.push(_config.contents[imgIndex]);
					}
					_config.contents = newContents;
					// 更新element img标签的data-index属性
					// console.log(newContents);

					pipe.pageEmit('contents', newContents);
				}
				return true; // elements can be dropped in any of the `containers` by default
			},
		});
	}

	$(document).ready(function() {
		setupSwiper();

		// 非预览是才可以进行拖拽配置
		if (!_is_preview) {
			buttonsDisplace();
			contentsDisplace();
		}
	})

	window.onload = function() {
		// 视图矫正
		// 1. 计算top banner和bottom banner的高度
		if (_config && _config['topBanner'] && _config['topBanner']) {
			const topHeight = $('#the-top-banners').height();
			$('#the-contents').css({
				'margin-top': topHeight
			})
		}
		if (_config && _config['bottomBanner'] && _config['bottomBanner']) {
			const bottomHeight = $('#the-bottom-banners').height();
			$('#the-contents').css({
				'margin-bottom': bottomHeight
			})
		}
	}

	






















	// 拖拽平台修改通知到配置平台
	function pageEmit(key, obj) {
		if (_callback_monitor) {
			_callback_monitor(key, obj);
		}
	}

	// 配置平台的改动需要通知到我这边进行数据结构的修改
	function configChange(_key, _obj) {
		_config[_key] = _obj;
		renderNode(_key, _obj);
	}

	function monitor(fn) {
		if (fn && typeof fn === 'function') {
			_callback_monitor = fn;
		}	
	}
	
	const factory = {};
	factory['pageEmit'] = pageEmit;
	factory['configChange'] = configChange;
	factory['monitor'] = monitor;
	factory['renderDom'] = render; 

	return factory;
});