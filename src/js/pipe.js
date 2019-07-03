(function(root, factory) {
	root['pipe'] = factory();
})(this, function() {
	const factory = {};

	// 由配置对象生成页面
	function config(cfg) {

	}

	// 拖拽平台修改通知到配置平台
	function pageEvent(key, obj) {
		if (factory.monitor && typeof factory.monitor === 'function') {
			factory.monitor(key, obj);
		}
	}

	// 配置平台的改动需要通知到我这边进行数据结构的修改
	function configChange(key, obj) {
		console.log(key, obj)
	}

	factory['pageEvent'] = pageEvent;
	factory['configChange'] = configChange;

	return factory;
});