const path = require('path');
const fs = require('fs');

const frappe_path = process.cwd();
const bench_path = path.resolve(frappe_path, '..', '..');
const sites_path = path.resolve(bench_path, 'sites');
const apps_list =
	fs.readFileSync(
		path.resolve(sites_path, 'apps.txt'), { encoding: 'utf-8' }
	).split('\n').filter(Boolean);
const assets_path = path.resolve(sites_path, 'assets');

const app_paths = apps_list.reduce((out, app) => {
	out[app] = path.resolve(bench_path, 'apps', app, app)
	return out;
}, {});
const public_paths = apps_list.reduce((out, app) => {
	out[app] = path.resolve(app_paths[app], 'public');
	return out;
}, {});
const public_js_paths = apps_list.reduce((out, app) => {
	out[app] = path.resolve(app_paths[app], 'public/js');
	return out;
}, {});

const bundle_map = apps_list.reduce((out, app) => {
	const public_js_path = public_js_paths[app];
	if ( fs.existsSync(public_js_path) ) {
		const all_files = fs.readdirSync(public_js_path);
		const js_files = all_files.filter(file => file.endsWith('.js'));

		for (let js_file of js_files) {
			const filename = path.basename(js_file).split('.')[0];
			out[path.join(app, 'js', filename)] = path.resolve(public_js_path, js_file);
		}
	}

	return out;
}, {});

const get_public_path = app => public_paths[app];

const get_build_json_path = app => path.resolve(get_public_path(app), 'build.json');

function get_build_json(app) {
	try {
		return require(get_build_json_path(app));
	} catch (e) {
		// build.json does not exist
		return null;
	}
}

function delete_file(path) {
	if (fs.existsSync(path)) {
		fs.unlinkSync(path);
	}
}

function run_serially(tasks) {
	let result = Promise.resolve();
	tasks.forEach(task => {
		if(task) {
			result = result.then ? result.then(task) : Promise.resolve();
		}
	});
	return result;
}

const get_app_path = app => app_paths[app];

module.exports = {
	sites_path,
	bundle_map,
	get_public_path,
	get_build_json_path,
	get_build_json,
	get_app_path,
	apps_list,
	assets_path,
	bench_path,
	delete_file,
	run_serially
};
