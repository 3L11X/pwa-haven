
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.5' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\modules\InstallPrompt.svelte generated by Svelte v3.42.5 */

    const file$1 = "src\\modules\\InstallPrompt.svelte";

    // (20:0) {#if deferredPrompt}
    function create_if_block(ctx) {
    	let div;
    	let h4;
    	let t1;
    	let button;
    	let span;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			h4.textContent = "Install";
    			t1 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "×";
    			t3 = text("\r\n    Click here to install the app for more features!");
    			attr_dev(h4, "class", "alert-heading");
    			add_location(h4, file$1, 21, 4, 515);
    			add_location(span, file$1, 22, 59, 614);
    			attr_dev(button, "class", "close");
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 22, 4, 559);
    			attr_dev(div, "class", "alert alert-success filled-dm show svelte-1qjuqpq");
    			add_location(div, file$1, 20, 2, 436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, span);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*dismiss*/ ctx[2], false, false, false),
    					listen_dev(div, "click", /*promptInstall*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(20:0) {#if deferredPrompt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*deferredPrompt*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*deferredPrompt*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InstallPrompt', slots, []);
    	let deferredPrompt;

    	window.addEventListener('beforeinstallprompt', e => {
    		e.preventDefault();
    		$$invalidate(0, deferredPrompt = e);
    	});

    	async function promptInstall() {
    		deferredPrompt.prompt();
    		const { outcome } = await deferredPrompt.userChoice;

    		if (outcome === 'accepted') {
    			$$invalidate(0, deferredPrompt = null);
    		}
    	}

    	function dismiss() {
    		$$invalidate(0, deferredPrompt = null);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InstallPrompt> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ deferredPrompt, promptInstall, dismiss });

    	$$self.$inject_state = $$props => {
    		if ('deferredPrompt' in $$props) $$invalidate(0, deferredPrompt = $$props.deferredPrompt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [deferredPrompt, promptInstall, dismiss];
    }

    class InstallPrompt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstallPrompt",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* eslint-env browser */
    const videoExtensions = ['3g2', '3gp', 'asf', 'avi', 'dv', 'flv', 'gxf', 'm2ts', 'm4a', 'm4b', 'm4p', 'm4r', 'm4v', 'mkv', 'mov', 'mp4', 'mpd', 'mpeg', 'mpg', 'mxf', 'nut', 'ogm', 'ogv', 'swf', 'ts', 'vob', 'webm', 'wmv', 'wtv'];
    const videoRx = new RegExp(`.(${videoExtensions.join('|')})$`, 'i');

    const subtitleExtensions = ['srt', 'vtt', 'ass', 'ssa', 'sub', 'txt'];
    const subRx = new RegExp(`.(${subtitleExtensions.join('|')})$`, 'i');

    const audioExtensions = ['3gp', '3gpp', '3g2', 'aac', 'adts', 'ac3', 'amr', 'eac3', 'flac', 'mp3', 'm4a', 'mp4', 'mp4a', 'mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a', 'oga', 'ogg', 'mogg', 'spx', 'opus', 'raw', 'wav', 'weba'];
    const audioRx = new RegExp(`.(${audioExtensions.join('|')})$`, 'i');

    const imageExtensions = ['apng', 'avif', 'bmp', 'gif', 'ico', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'tif', 'tiff', 'webp'];
    const imageRx = new RegExp(`.(${imageExtensions.join('|')})$`, 'i');

    const bookExtensions = ['epub', 'cbr', 'cba', 'cbt', 'cbz', 'cb7', 'zip'];
    const bookRx = new RegExp(`.(${bookExtensions.join('|')})$`, 'i');

    const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser());

    /* eslint-env browser */

    // types: image, audio, video, subtitle
    async function handleItems (transferList = [], types = []) {
      const items = await Promise.all([...transferList].map(item => processItem(item, types)));
      return items.flat().filter(i => i)
    }
    const rxMap = {
      audio: audioRx,
      video: videoRx,
      image: imageRx,
      subtitle: subRx,
      book: bookRx
    };
    const exMap = {
      audio: audioExtensions,
      video: videoExtensions,
      image: imageExtensions,
      subtitle: subtitleExtensions,
      book: bookExtensions
    };
    const selectorMap = {
      image: 'img',
      subtitle: 'input'
    };

    async function processItem (item, types) {
      if (!item) return null
      if (item.type) {
        // type matches File
        if (types.some(type => item.type.indexOf(type) === 0)) return item.getAsFile()
        // text
        if (item.type === 'text/plain') {
          // URL
          if (item.kind === 'string') {
            const string = await new Promise(resolve => item.getAsString(resolve));
            try {
              // URL might be invalid
              const url = new URL(string);
              const type = types.find(type => string.match(rxMap[type]));
              if (url && type) {
                return {
                  url: string,
                  name: string.substring(string.lastIndexOf('/') + 1),
                  type
                }
              }
            } catch (e) { }
            return null
          }
          // Text File
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (types.some(type => file.name.match(rxMap[type]))) return file
          }
          return null
        }
        // XML or clipboard
        if (item.type === 'text/html') {
          const string = await new Promise(resolve => item.getAsString(resolve));
          const elems = types.map(type => DOMPARSER(string, 'text/html').querySelectorAll(selectorMap[type] || type)).flat();
          if (!elems.length) return null
          return elems.map(elem => {
            const url = elem.src || elem.value;
            if (url) {
              return {
                url,
                name: url.substring(url.lastIndexOf('/') + 1)
              }
            }
            return null
          })
        }
      }
      // Folder or unknown file type
      const entry = item.webkitGetAsEntry();
      if (entry?.isDirectory) {
        const entries = await new Promise(resolve => entry.createReader().readEntries(resolve));
        const filePromises = entries.filter(entry => entry.isFile && types.some(type => entry.name.match(rxMap[type]))).map(file => new Promise(resolve => file.file(resolve)));
        return Promise.all(filePromises)
      }
      if (entry?.isFile) {
        if (types.some(type => entry.name.match(rxMap[type]))) {
          return new Promise(resolve => entry.file(resolve))
        }
      }
    }
    function filePopup (types = []) {
      return new Promise(resolve => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = 'multiple';
        input.accept = types.map(type => '.' + exMap[type].join(',.')).flat();

        input.onchange = async ({ target }) => {
          resolve([...target.files]);
          input = null;
        };
        input.click();
      })
    }

    function getSearchFiles (types) {
      const search = [...new URLSearchParams(location.search)];
      if (!search.length) return null
      const files = [];
      for (const param of search) {
        const type = types.find(type => param[1].match(rxMap[type]));
        if (type) {
          const name = param[1].substring(Math.max(param[1].lastIndexOf('\\') + 2, param[1].lastIndexOf('/') + 1));
          files.push({
            name,
            url: param[1]
          });
        }
      }
      return files
    }
    async function getLaunchFiles () {
      /* global launchQueue */
      return new Promise(resolve => {
        launchQueue.setConsumer(async launchParams => {
          if (!launchParams.files.length) {
            return
          }
          const promises = launchParams.files.map(file => file.getFile());
          // for some fucking reason, the same file can get passed multiple times, why? I still want to future-proof multi-files
          resolve((await Promise.all(promises)).filter((file, index, all) => {
            return all.findIndex(search => {
              return search.name === file.name && search.size === file.size && search.lastModified === file.lastModified
            }) === index
          }));
        });
      })
    }

    /* unzipit@1.3.6, license MIT */
    /* global SharedArrayBuffer, process */

    function readBlobAsArrayBuffer(blob) {
      if (blob.arrayBuffer) {
        return blob.arrayBuffer();
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
          resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
      });
    }

    async function readBlobAsUint8Array(blob) {
      const arrayBuffer = await readBlobAsArrayBuffer(blob);
      return new Uint8Array(arrayBuffer);
    }

    function isBlob(v) {
      return typeof Blob !== 'undefined' && v instanceof Blob;
    }

    function isSharedArrayBuffer(b) {
      return typeof SharedArrayBuffer !== 'undefined' && b instanceof SharedArrayBuffer;
    }

    const isNode =
        (typeof process !== 'undefined') &&
        process.versions &&
        (typeof process.versions.node !== 'undefined') &&
        (typeof process.versions.electron === 'undefined');

    function isTypedArraySameAsArrayBuffer(typedArray) {
      return typedArray.byteOffset === 0 && typedArray.byteLength === typedArray.buffer.byteLength;
    }

    class ArrayBufferReader {
      constructor(arrayBufferOrView) {
        this.typedArray = (arrayBufferOrView instanceof ArrayBuffer || isSharedArrayBuffer(arrayBufferOrView))
           ? new Uint8Array(arrayBufferOrView)
           : new Uint8Array(arrayBufferOrView.buffer, arrayBufferOrView.byteOffset, arrayBufferOrView.byteLength);
      }
      async getLength() {
        return this.typedArray.byteLength;
      }
      async read(offset, length) {
        return new Uint8Array(this.typedArray.buffer, this.typedArray.byteOffset + offset, length);
      }
    }

    class BlobReader {
      constructor(blob) {
        this.blob = blob;
      }
      async getLength() {
        return this.blob.size;
      }
      async read(offset, length) {
        const blob = this.blob.slice(offset, offset + length);
        const arrayBuffer = await readBlobAsArrayBuffer(blob);
        return new Uint8Array(arrayBuffer);
      }
      async sliceAsBlob(offset, length, type = '') {
        return this.blob.slice(offset, offset + length, type);
      }
    }

    function inflate(data, buf) {
    	var u8=Uint8Array;
    	if(data[0]==3 && data[1]==0) return (buf ? buf : new u8(0));
    	var bitsF = _bitsF, bitsE = _bitsE, decodeTiny = _decodeTiny, get17 = _get17;
    	
    	var noBuf = (buf==null);
    	if(noBuf) buf = new u8((data.length>>>2)<<3);
    	
    	var BFINAL=0, BTYPE=0, HLIT=0, HDIST=0, HCLEN=0, ML=0, MD=0; 	
    	var off = 0, pos = 0;
    	var lmap, dmap;
    	
    	while(BFINAL==0) {		
    		BFINAL = bitsF(data, pos  , 1);
    		BTYPE  = bitsF(data, pos+1, 2);  pos+=3;
    		//console.log(BFINAL, BTYPE);
    		
    		if(BTYPE==0) {
    			if((pos&7)!=0) pos+=8-(pos&7);
    			var p8 = (pos>>>3)+4, len = data[p8-4]|(data[p8-3]<<8);  //console.log(len);//bitsF(data, pos, 16), 
    			if(noBuf) buf=_check(buf, off+len);
    			buf.set(new u8(data.buffer, data.byteOffset+p8, len), off);
    			//for(var i=0; i<len; i++) buf[off+i] = data[p8+i];
    			//for(var i=0; i<len; i++) if(buf[off+i] != data[p8+i]) throw "e";
    			pos = ((p8+len)<<3);  off+=len;  continue;
    		}
    		if(noBuf) buf=_check(buf, off+(1<<17));  // really not enough in many cases (but PNG and ZIP provide buffer in advance)
    		if(BTYPE==1) {  lmap = U.flmap;  dmap = U.fdmap;  ML = (1<<9)-1;  MD = (1<<5)-1;   }
    		if(BTYPE==2) {
    			HLIT  = bitsE(data, pos   , 5)+257;  
    			HDIST = bitsE(data, pos+ 5, 5)+  1;  
    			HCLEN = bitsE(data, pos+10, 4)+  4;  pos+=14;
    			for(var i=0; i<38; i+=2) {  U.itree[i]=0;  U.itree[i+1]=0;  }
    			var tl = 1;
    			for(var i=0; i<HCLEN; i++) {  var l=bitsE(data, pos+i*3, 3);  U.itree[(U.ordr[i]<<1)+1] = l;  if(l>tl)tl=l;  }     pos+=3*HCLEN;  //console.log(itree);
    			makeCodes(U.itree, tl);
    			codes2map(U.itree, tl, U.imap);
    			
    			lmap = U.lmap;  dmap = U.dmap;
    			
    			pos = decodeTiny(U.imap, (1<<tl)-1, HLIT+HDIST, data, pos, U.ttree);
    			var mx0 = _copyOut(U.ttree,    0, HLIT , U.ltree);  ML = (1<<mx0)-1;
    			var mx1 = _copyOut(U.ttree, HLIT, HDIST, U.dtree);  MD = (1<<mx1)-1;
    			
    			//var ml = decodeTiny(U.imap, (1<<tl)-1, HLIT , data, pos, U.ltree); ML = (1<<(ml>>>24))-1;  pos+=(ml&0xffffff);
    			makeCodes(U.ltree, mx0);
    			codes2map(U.ltree, mx0, lmap);
    			
    			//var md = decodeTiny(U.imap, (1<<tl)-1, HDIST, data, pos, U.dtree); MD = (1<<(md>>>24))-1;  pos+=(md&0xffffff);
    			makeCodes(U.dtree, mx1);
    			codes2map(U.dtree, mx1, dmap);
    		}
    		//var ooff=off, opos=pos;
    		while(true) {
    			var code = lmap[get17(data, pos) & ML];  pos += code&15;
    			var lit = code>>>4;  //U.lhst[lit]++;  
    			if((lit>>>8)==0) {  buf[off++] = lit;  }
    			else if(lit==256) {  break;  }
    			else {
    				var end = off+lit-254;
    				if(lit>264) { var ebs = U.ldef[lit-257];  end = off + (ebs>>>3) + bitsE(data, pos, ebs&7);  pos += ebs&7;  }
    				//dst[end-off]++;
    				
    				var dcode = dmap[get17(data, pos) & MD];  pos += dcode&15;
    				var dlit = dcode>>>4;
    				var dbs = U.ddef[dlit], dst = (dbs>>>4) + bitsF(data, pos, dbs&15);  pos += dbs&15;
    				
    				//var o0 = off-dst, stp = Math.min(end-off, dst);
    				//if(stp>20) while(off<end) {  buf.copyWithin(off, o0, o0+stp);  off+=stp;  }  else
    				//if(end-dst<=off) buf.copyWithin(off, off-dst, end-dst);  else
    				//if(dst==1) buf.fill(buf[off-1], off, end);  else
    				if(noBuf) buf=_check(buf, off+(1<<17));
    				while(off<end) {  buf[off]=buf[off++-dst];    buf[off]=buf[off++-dst];  buf[off]=buf[off++-dst];  buf[off]=buf[off++-dst];  }   
    				off=end;
    				//while(off!=end) {  buf[off]=buf[off++-dst];  }
    			}
    		}
    		//console.log(off-ooff, (pos-opos)>>>3);
    	}
    	//console.log(dst);
    	//console.log(tlen, dlen, off-tlen+tcnt);
    	return buf.length==off ? buf : buf.slice(0,off);
    }
    function _check(buf, len) {
    	var bl=buf.length;  if(len<=bl) return buf;
    	var nbuf = new Uint8Array(Math.max(bl<<1,len));  nbuf.set(buf,0);
    	//for(var i=0; i<bl; i+=4) {  nbuf[i]=buf[i];  nbuf[i+1]=buf[i+1];  nbuf[i+2]=buf[i+2];  nbuf[i+3]=buf[i+3];  }
    	return nbuf;
    }

    function _decodeTiny(lmap, LL, len, data, pos, tree) {
    	var bitsE = _bitsE, get17 = _get17;
    	var i = 0;
    	while(i<len) {
    		var code = lmap[get17(data, pos)&LL];  pos+=code&15;
    		var lit = code>>>4; 
    		if(lit<=15) {  tree[i]=lit;  i++;  }
    		else {
    			var ll = 0, n = 0;
    			if(lit==16) {
    				n = (3  + bitsE(data, pos, 2));  pos += 2;  ll = tree[i-1];
    			}
    			else if(lit==17) {
    				n = (3  + bitsE(data, pos, 3));  pos += 3;
    			}
    			else if(lit==18) {
    				n = (11 + bitsE(data, pos, 7));  pos += 7;
    			}
    			var ni = i+n;
    			while(i<ni) {  tree[i]=ll;  i++; }
    		}
    	}
    	return pos;
    }
    function _copyOut(src, off, len, tree) {
    	var mx=0, i=0, tl=tree.length>>>1;
    	while(i<len) {  var v=src[i+off];  tree[(i<<1)]=0;  tree[(i<<1)+1]=v;  if(v>mx)mx=v;  i++;  }
    	while(i<tl ) {  tree[(i<<1)]=0;  tree[(i<<1)+1]=0;  i++;  }
    	return mx;
    }

    function makeCodes(tree, MAX_BITS) {  // code, length
    	var max_code = tree.length;
    	var code, bits, n, i, len;
    	
    	var bl_count = U.bl_count;  for(var i=0; i<=MAX_BITS; i++) bl_count[i]=0;
    	for(i=1; i<max_code; i+=2) bl_count[tree[i]]++;
    	
    	var next_code = U.next_code;	// smallest code for each length
    	
    	code = 0;
    	bl_count[0] = 0;
    	for (bits = 1; bits <= MAX_BITS; bits++) {
    		code = (code + bl_count[bits-1]) << 1;
    		next_code[bits] = code;
    	}
    	
    	for (n = 0; n < max_code; n+=2) {
    		len = tree[n+1];
    		if (len != 0) {
    			tree[n] = next_code[len];
    			next_code[len]++;
    		}
    	}
    }
    function codes2map(tree, MAX_BITS, map) {
    	var max_code = tree.length;
    	var r15 = U.rev15;
    	for(var i=0; i<max_code; i+=2) if(tree[i+1]!=0)  {
    		var lit = i>>1;
    		var cl = tree[i+1], val = (lit<<4)|cl; // :  (0x8000 | (U.of0[lit-257]<<7) | (U.exb[lit-257]<<4) | cl);
    		var rest = (MAX_BITS-cl), i0 = tree[i]<<rest, i1 = i0 + (1<<rest);
    		//tree[i]=r15[i0]>>>(15-MAX_BITS);
    		while(i0!=i1) {
    			var p0 = r15[i0]>>>(15-MAX_BITS);
    			map[p0]=val;  i0++;
    		}
    	}
    }
    function revCodes(tree, MAX_BITS) {
    	var r15 = U.rev15, imb = 15-MAX_BITS;
    	for(var i=0; i<tree.length; i+=2) {  var i0 = (tree[i]<<(MAX_BITS-tree[i+1]));  tree[i] = r15[i0]>>>imb;  }
    }

    function _bitsE(dt, pos, length) {  return ((dt[pos>>>3] | (dt[(pos>>>3)+1]<<8)                        )>>>(pos&7))&((1<<length)-1);  }
    function _bitsF(dt, pos, length) {  return ((dt[pos>>>3] | (dt[(pos>>>3)+1]<<8) | (dt[(pos>>>3)+2]<<16))>>>(pos&7))&((1<<length)-1);  }
    /*
    function _get9(dt, pos) {
    	return ((dt[pos>>>3] | (dt[(pos>>>3)+1]<<8))>>>(pos&7))&511;
    } */
    function _get17(dt, pos) {	// return at least 17 meaningful bytes
    	return (dt[pos>>>3] | (dt[(pos>>>3)+1]<<8) | (dt[(pos>>>3)+2]<<16) )>>>(pos&7);
    }
    const U = function(){
    	var u16=Uint16Array, u32=Uint32Array;
    	return {
    		next_code : new u16(16),
    		bl_count  : new u16(16),
    		ordr : [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ],
    		of0  : [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,999,999,999],
    		exb  : [0,0,0,0,0,0,0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4,  4,  5,  5,  5,  5,  0,  0,  0,  0],
    		ldef : new u16(32),
    		df0  : [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577, 65535, 65535],
    		dxb  : [0,0,0,0,1,1,2, 2, 3, 3, 4, 4, 5, 5,  6,  6,  7,  7,  8,  8,   9,   9,  10,  10,  11,  11,  12,   12,   13,   13,     0,     0],
    		ddef : new u32(32),
    		flmap: new u16(  512),  fltree: [],
    		fdmap: new u16(   32),  fdtree: [],
    		lmap : new u16(32768),  ltree : [],  ttree:[],
    		dmap : new u16(32768),  dtree : [],
    		imap : new u16(  512),  itree : [],
    		//rev9 : new u16(  512)
    		rev15: new u16(1<<15),
    		lhst : new u32(286), dhst : new u32( 30), ihst : new u32(19),
    		lits : new u32(15000),
    		strt : new u16(1<<16),
    		prev : new u16(1<<15)
    	};  
    } ();

    (function(){	
    	var len = 1<<15;
    	for(var i=0; i<len; i++) {
    		var x = i;
    		x = (((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1));
    		x = (((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2));
    		x = (((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4));
    		x = (((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8));
    		U.rev15[i] = (((x >>> 16) | (x << 16)))>>>17;
    	}
    	
    	function pushV(tgt, n, sv) {  while(n--!=0) tgt.push(0,sv);  }
    	
    	for(var i=0; i<32; i++) {  U.ldef[i]=(U.of0[i]<<3)|U.exb[i];  U.ddef[i]=(U.df0[i]<<4)|U.dxb[i];  }
    	
    	pushV(U.fltree, 144, 8);  pushV(U.fltree, 255-143, 9);  pushV(U.fltree, 279-255, 7);  pushV(U.fltree,287-279,8);
    	/*
    	var i = 0;
    	for(; i<=143; i++) U.fltree.push(0,8);
    	for(; i<=255; i++) U.fltree.push(0,9);
    	for(; i<=279; i++) U.fltree.push(0,7);
    	for(; i<=287; i++) U.fltree.push(0,8);
    	*/
    	makeCodes(U.fltree, 9);
    	codes2map(U.fltree, 9, U.flmap);
    	revCodes (U.fltree, 9);
    	
    	pushV(U.fdtree,32,5);
    	//for(i=0;i<32; i++) U.fdtree.push(0,5);
    	makeCodes(U.fdtree, 5);
    	codes2map(U.fdtree, 5, U.fdmap);
    	revCodes (U.fdtree, 5);
    	
    	pushV(U.itree,19,0);  pushV(U.ltree,286,0);  pushV(U.dtree,30,0);  pushV(U.ttree,320,0);
    	/*
    	for(var i=0; i< 19; i++) U.itree.push(0,0);
    	for(var i=0; i<286; i++) U.ltree.push(0,0);
    	for(var i=0; i< 30; i++) U.dtree.push(0,0);
    	for(var i=0; i<320; i++) U.ttree.push(0,0);
    	*/
    })();

    const crc = {
    	table : ( function() {
    	   var tab = new Uint32Array(256);
    	   for (var n=0; n<256; n++) {
    			var c = n;
    			for (var k=0; k<8; k++) {
    				if (c & 1)  c = 0xedb88320 ^ (c >>> 1);
    				else        c = c >>> 1;
    			}
    			tab[n] = c;  }    
    		return tab;  })(),
    	update : function(c, buf, off, len) {
    		for (var i=0; i<len; i++)  c = crc.table[(c ^ buf[off+i]) & 0xff] ^ (c >>> 8);
    		return c;
    	},
    	crc : function(b,o,l)  {  return crc.update(0xffffffff,b,o,l) ^ 0xffffffff;  }
    };

    function inflateRaw(file, buf) {  return inflate(file, buf);  }

    /* global module */

    const config = {
      numWorkers: 1,
      workerURL: '',
      useWorkers: false,
    };

    let nextId = 0;
    const waitingForWorkerQueue = [];

    // Because Firefox uses non-standard onerror to signal an error.
    function startWorker(url) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(url);
        worker.onmessage = (e) => {
          if (e.data === 'start') {
            worker.onerror = undefined;
            worker.onmessage = undefined;
            resolve(worker);
          } else {
            reject(new Error(`unexpected message: ${e.data}`));
          }
        };
        worker.onerror = reject;
      });
    }

    function dynamicRequire(mod, request) {
      return mod.require(request);
    }

    ((function() {
      if (isNode) {
        // We need to use `dynamicRequire` because `require` on it's own will be optimized by webpack.
        const {Worker} = dynamicRequire(module, 'worker_threads');
        return {
          async createWorker(url) {
            return new Worker(url);
          },
          addEventListener(worker, fn) {
            worker.on('message', (data) => {
              fn({target: worker, data});
            });
          },
          async terminate(worker) {
            await worker.terminate();
          },
        };
      } else {
        return {
          async createWorker(url) {
            // I don't understand this security issue
            // Apparently there is some iframe setting or http header
            // that prevents cross domain workers. But, I can manually
            // download the text and do it. I reported this to Chrome
            // and they said it was fine so ¯\_(ツ)_/¯
            try {
              const worker = await startWorker(url);
              return worker;
            } catch (e) {
              console.warn('could not load worker:', url);
            }

            let text;
            try {
              const req = await fetch(url, {mode: 'cors'});
              if (!req.ok) {
                throw new Error(`could not load: ${url}`);
              }
              text = await req.text();
              url = URL.createObjectURL(new Blob([text], {type: 'application/javascript'}));
              const worker = await startWorker(url);
              config.workerURL = url;  // this is a hack. What's a better way to structure this code?
              return worker;
            } catch (e) {
              console.warn('could not load worker via fetch:', url);
            }

            if (text !== undefined) {
              try {
                url = `data:application/javascript;base64,${btoa(text)}`;
                const worker = await startWorker(url);
                config.workerURL = url;
                return worker;
              } catch (e) {
                console.warn('could not load worker via dataURI');
              }
            }

            console.warn('workers will not be used');
            throw new Error('can not start workers');
          },
          addEventListener(worker, fn) {
            worker.addEventListener('message', fn);
          },
          async terminate(worker) {
            worker.terminate();
          },
        };
      }
    })());

    // @param {Uint8Array} src
    // @param {number} uncompressedSize
    // @param {string} [type] mime-type
    // @returns {ArrayBuffer|Blob} ArrayBuffer if type is falsy or Blob otherwise.
    function inflateRawLocal(src, uncompressedSize, type, resolve) {
      const dst = new Uint8Array(uncompressedSize);
      inflateRaw(src, dst);
      resolve(type
         ? new Blob([dst], {type})
         : dst.buffer);
    }

    async function processWaitingForWorkerQueue() {
      if (waitingForWorkerQueue.length === 0) {
        return;
      }

      // inflate locally
      // We loop here because what happens if many requests happen at once
      // the first N requests will try to async make a worker. Other requests
      // will then be on the queue. But if we fail to make workers then there
      // are pending requests.
      while (waitingForWorkerQueue.length) {
        const {src, uncompressedSize, type, resolve} = waitingForWorkerQueue.shift();
        let data = src;
        if (isBlob(src)) {
          data = await readBlobAsUint8Array(src);
        }
        inflateRawLocal(data, uncompressedSize, type, resolve);
      }
    }

    // It has to take non-zero time to put a large typed array in a Blob since the very
    // next instruction you could change the contents of the array. So, if you're reading
    // the zip file for images/video/audio then all you want is a Blob on which to get a URL.
    // so that operation of putting the data in a Blob should happen in the worker.
    //
    // Conversely if you want the data itself then you want an ArrayBuffer immediately
    // since the worker can transfer its ArrayBuffer zero copy.
    //
    // @param {Uint8Array|Blob} src
    // @param {number} uncompressedSize
    // @param {string} [type] falsy or mimeType string (eg: 'image/png')
    // @returns {ArrayBuffer|Blob} ArrayBuffer if type is falsy or Blob otherwise.
    function inflateRawAsync(src, uncompressedSize, type) {
      return new Promise((resolve, reject) => {
        // note: there is potential an expensive copy here. In order for the data
        // to make it into the worker we need to copy the data to the worker unless
        // it's a Blob or a SharedArrayBuffer.
        //
        // Solutions:
        //
        // 1. A minor enhancement, if `uncompressedSize` is small don't call the worker.
        //
        //    might be a win period as their is overhead calling the worker
        //
        // 2. Move the entire library to the worker
        //
        //    Good, Maybe faster if you pass a URL, Blob, or SharedArrayBuffer? Not sure about that
        //    as those are also easy to transfer. Still slow if you pass an ArrayBuffer
        //    as the ArrayBuffer has to be copied to the worker.
        //
        // I guess benchmarking is really the only thing to try.
        waitingForWorkerQueue.push({src, uncompressedSize, type, resolve, reject, id: nextId++});
        processWaitingForWorkerQueue();
      });
    }

    /*
    class Zip {
      constructor(reader) {
        comment,  // the comment for this entry
        commentBytes, // the raw comment for this entry
      }
    }
    */

    function dosDateTimeToDate(date, time) {
      const day = date & 0x1f; // 1-31
      const month = (date >> 5 & 0xf) - 1; // 1-12, 0-11
      const year = (date >> 9 & 0x7f) + 1980; // 0-128, 1980-2108

      const millisecond = 0;
      const second = (time & 0x1f) * 2; // 0-29, 0-58 (even numbers)
      const minute = time >> 5 & 0x3f; // 0-59
      const hour = time >> 11 & 0x1f; // 0-23

      return new Date(year, month, day, hour, minute, second, millisecond);
    }

    class ZipEntry {
      constructor(reader, rawEntry) {
        this._reader = reader;
        this._rawEntry = rawEntry;
        this.name = rawEntry.name;
        this.nameBytes = rawEntry.nameBytes;
        this.size = rawEntry.uncompressedSize;
        this.compressedSize = rawEntry.compressedSize;
        this.comment = rawEntry.comment;
        this.commentBytes = rawEntry.commentBytes;
        this.compressionMethod = rawEntry.compressionMethod;
        this.lastModDate = dosDateTimeToDate(rawEntry.lastModFileDate, rawEntry.lastModFileTime);
        this.isDirectory = rawEntry.uncompressedSize === 0 && rawEntry.name.endsWith('/');
        this.encrypted = !!(rawEntry.generalPurposeBitFlag & 0x1);
      }
      // returns a promise that returns a Blob for this entry
      async blob(type = 'application/octet-stream') {
        return await readEntryDataAsBlob(this._reader, this._rawEntry, type);
      }
      // returns a promise that returns an ArrayBuffer for this entry
      async arrayBuffer() {
        return await readEntryDataAsArrayBuffer(this._reader, this._rawEntry);
      }
      // returns text, assumes the text is valid utf8. If you want more options decode arrayBuffer yourself
      async text() {
        const buffer = await this.arrayBuffer();
        return decodeBuffer(new Uint8Array(buffer));
      }
      // returns text with JSON.parse called on it. If you want more options decode arrayBuffer yourself
      async json() {
        const text = await this.text();
        return JSON.parse(text);
      }
    }

    const EOCDR_WITHOUT_COMMENT_SIZE = 22;
    const MAX_COMMENT_SIZE = 0xffff; // 2-byte size
    const EOCDR_SIGNATURE = 0x06054b50;
    const ZIP64_EOCDR_SIGNATURE = 0x06064b50;

    async function readAs(reader, offset, length) {
      return await reader.read(offset, length);
    }

    // The point of this function is we want to be able to pass the data
    // to a worker as fast as possible so when decompressing if the data
    // is already a blob and we can get a blob then get a blob.
    //
    // I'm not sure what a better way to refactor this is. We've got examples
    // of multiple readers. Ideally, for every type of reader we could ask
    // it, "give me a type that is zero copy both locally and when sent to a worker".
    //
    // The problem is the worker would also have to know the how to handle this
    // opaque type. I suppose the correct solution is to register different
    // reader handlers in the worker so BlobReader would register some
    // `handleZeroCopyType<BlobReader>`. At the moment I don't feel like
    // refactoring. As it is you just pass in an instance of the reader
    // but instead you'd have to register the reader and some how get the
    // source for the `handleZeroCopyType` handler function into the worker.
    // That sounds like a huge PITA, requiring you to put the implementation
    // in a separate file so the worker can load it or some other workaround
    // hack.
    //
    // For now this hack works even if it's not generic.
    async function readAsBlobOrTypedArray(reader, offset, length, type) {
      if (reader.sliceAsBlob) {
        return await reader.sliceAsBlob(offset, length, type);
      }
      return await reader.read(offset, length);
    }

    const crc$1 = {
      unsigned() {
        return 0;
      },
    };

    function getUint16LE(uint8View, offset) {
      return uint8View[offset    ] +
             uint8View[offset + 1] * 0x100;
    }

    function getUint32LE(uint8View, offset) {
      return uint8View[offset    ] +
             uint8View[offset + 1] * 0x100 +
             uint8View[offset + 2] * 0x10000 +
             uint8View[offset + 3] * 0x1000000;
    }

    function getUint64LE(uint8View, offset) {
      return getUint32LE(uint8View, offset) +
             getUint32LE(uint8View, offset + 4) * 0x100000000;
    }

    /* eslint-disable no-irregular-whitespace */
    // const decodeCP437 = (function() {
    //   const cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
    //
    //   return function(uint8view) {
    //     return Array.from(uint8view).map(v => cp437[v]).join('');
    //   };
    // }());
    /* eslint-enable no-irregular-whitespace */

    const utf8Decoder = new TextDecoder();
    function decodeBuffer(uint8View, isUTF8) {  /* eslint-disable-line no-unused-vars */ /* lgtm [js/superfluous-trailing-arguments] */
      if (isSharedArrayBuffer(uint8View.buffer)) {
        uint8View = new Uint8Array(uint8View);
      }
      return utf8Decoder.decode(uint8View);
      /*
      AFAICT the UTF8 flat is not set so it's 100% up to the user
      to self decode if their file is not utf8 filenames
      return isUTF8
          ? utf8Decoder.decode(uint8View)
          : decodeCP437(uint8View);
      */
    }

    async function findEndOfCentralDirector(reader, totalLength) {
      const size = Math.min(EOCDR_WITHOUT_COMMENT_SIZE + MAX_COMMENT_SIZE, totalLength);
      const readStart = totalLength - size;
      const data = await readAs(reader, readStart, size);
      for (let i = size - EOCDR_WITHOUT_COMMENT_SIZE; i >= 0; --i) {
        if (getUint32LE(data, i) !== EOCDR_SIGNATURE) {
          continue;
        }

        // 0 - End of central directory signature
        const eocdr = new Uint8Array(data.buffer, data.byteOffset + i, data.byteLength - i);
        // 4 - Number of this disk
        const diskNumber = getUint16LE(eocdr, 4);
        if (diskNumber !== 0) {
          throw new Error(`multi-volume zip files are not supported. This is volume: ${diskNumber}`);
        }

        // 6 - Disk where central directory starts
        // 8 - Number of central directory records on this disk
        // 10 - Total number of central directory records
        const entryCount = getUint16LE(eocdr, 10);
        // 12 - Size of central directory (bytes)
        const centralDirectorySize = getUint32LE(eocdr, 12);
        // 16 - Offset of start of central directory, relative to start of archive
        const centralDirectoryOffset = getUint32LE(eocdr, 16);
        // 20 - Comment length
        const commentLength = getUint16LE(eocdr, 20);
        const expectedCommentLength = eocdr.length - EOCDR_WITHOUT_COMMENT_SIZE;
        if (commentLength !== expectedCommentLength) {
          throw new Error(`invalid comment length. expected: ${expectedCommentLength}, actual: ${commentLength}`);
        }

        // 22 - Comment
        // the encoding is always cp437.
        const commentBytes = new Uint8Array(eocdr.buffer, eocdr.byteOffset + 22, commentLength);
        const comment = decodeBuffer(commentBytes);

        if (entryCount === 0xffff || centralDirectoryOffset === 0xffffffff) {
          return await readZip64CentralDirectory(reader, readStart + i, comment, commentBytes);
        } else {
          return await readEntries(reader, centralDirectoryOffset, centralDirectorySize, entryCount, comment, commentBytes);
        }
      }

      throw new Error('could not find end of central directory. maybe not zip file');
    }

    const END_OF_CENTRAL_DIRECTORY_LOCATOR_SIGNATURE = 0x07064b50;

    async function readZip64CentralDirectory(reader, offset, comment, commentBytes) {
      // ZIP64 Zip64 end of central directory locator
      const zip64EocdlOffset = offset - 20;
      const eocdl = await readAs(reader, zip64EocdlOffset, 20);

      // 0 - zip64 end of central dir locator signature
      if (getUint32LE(eocdl, 0) !== END_OF_CENTRAL_DIRECTORY_LOCATOR_SIGNATURE) {
        throw new Error('invalid zip64 end of central directory locator signature');
      }

      // 4 - number of the disk with the start of the zip64 end of central directory
      // 8 - relative offset of the zip64 end of central directory record
      const zip64EocdrOffset = getUint64LE(eocdl, 8);
      // 16 - total number of disks

      // ZIP64 end of central directory record
      const zip64Eocdr = await readAs(reader, zip64EocdrOffset, 56);

      // 0 - zip64 end of central dir signature                           4 bytes  (0x06064b50)
      if (getUint32LE(zip64Eocdr, 0) !== ZIP64_EOCDR_SIGNATURE) {
        throw new Error('invalid zip64 end of central directory record signature');
      }
      // 4 - size of zip64 end of central directory record                8 bytes
      // 12 - version made by                                             2 bytes
      // 14 - version needed to extract                                   2 bytes
      // 16 - number of this disk                                         4 bytes
      // 20 - number of the disk with the start of the central directory  4 bytes
      // 24 - total number of entries in the central directory on this disk         8 bytes
      // 32 - total number of entries in the central directory            8 bytes
      const entryCount = getUint64LE(zip64Eocdr, 32);
      // 40 - size of the central directory                               8 bytes
      const centralDirectorySize = getUint64LE(zip64Eocdr, 40);
      // 48 - offset of start of central directory with respect to the starting disk number     8 bytes
      const centralDirectoryOffset = getUint64LE(zip64Eocdr, 48);
      // 56 - zip64 extensible data sector                                (variable size)
      return readEntries(reader, centralDirectoryOffset, centralDirectorySize, entryCount, comment, commentBytes);
    }

    const CENTRAL_DIRECTORY_FILE_HEADER_SIGNATURE = 0x02014b50;

    async function readEntries(reader, centralDirectoryOffset, centralDirectorySize, rawEntryCount, comment, commentBytes) {
      let readEntryCursor = 0;
      const allEntriesBuffer = await readAs(reader, centralDirectoryOffset, centralDirectorySize);
      const rawEntries = [];

      for (let e = 0; e < rawEntryCount; ++e) {
        const buffer = allEntriesBuffer.subarray(readEntryCursor, readEntryCursor + 46);
        // 0 - Central directory file header signature
        const signature = getUint32LE(buffer, 0);
        if (signature !== CENTRAL_DIRECTORY_FILE_HEADER_SIGNATURE) {
          throw new Error(`invalid central directory file header signature: 0x${signature.toString(16)}`);
        }
        const rawEntry = {
          // 4 - Version made by
          versionMadeBy: getUint16LE(buffer, 4),
          // 6 - Version needed to extract (minimum)
          versionNeededToExtract: getUint16LE(buffer, 6),
          // 8 - General purpose bit flag
          generalPurposeBitFlag: getUint16LE(buffer, 8),
          // 10 - Compression method
          compressionMethod: getUint16LE(buffer, 10),
          // 12 - File last modification time
          lastModFileTime: getUint16LE(buffer, 12),
          // 14 - File last modification date
          lastModFileDate: getUint16LE(buffer, 14),
          // 16 - CRC-32
          crc32: getUint32LE(buffer, 16),
          // 20 - Compressed size
          compressedSize: getUint32LE(buffer, 20),
          // 24 - Uncompressed size
          uncompressedSize: getUint32LE(buffer, 24),
          // 28 - File name length (n)
          fileNameLength: getUint16LE(buffer, 28),
          // 30 - Extra field length (m)
          extraFieldLength: getUint16LE(buffer, 30),
          // 32 - File comment length (k)
          fileCommentLength: getUint16LE(buffer, 32),
          // 34 - Disk number where file starts
          // 36 - Internal file attributes
          internalFileAttributes: getUint16LE(buffer, 36),
          // 38 - External file attributes
          externalFileAttributes: getUint32LE(buffer, 38),
          // 42 - Relative offset of local file header
          relativeOffsetOfLocalHeader: getUint32LE(buffer, 42),
        };

        if (rawEntry.generalPurposeBitFlag & 0x40) {
          throw new Error('strong encryption is not supported');
        }

        readEntryCursor += 46;

        const data = allEntriesBuffer.subarray(readEntryCursor, readEntryCursor + rawEntry.fileNameLength + rawEntry.extraFieldLength + rawEntry.fileCommentLength);
        rawEntry.nameBytes = data.slice(0, rawEntry.fileNameLength);
        rawEntry.name = decodeBuffer(rawEntry.nameBytes);

        // 46+n - Extra field
        const fileCommentStart = rawEntry.fileNameLength + rawEntry.extraFieldLength;
        const extraFieldBuffer = data.slice(rawEntry.fileNameLength, fileCommentStart);
        rawEntry.extraFields = [];
        let i = 0;
        while (i < extraFieldBuffer.length - 3) {
          const headerId = getUint16LE(extraFieldBuffer, i + 0);
          const dataSize = getUint16LE(extraFieldBuffer, i + 2);
          const dataStart = i + 4;
          const dataEnd = dataStart + dataSize;
          if (dataEnd > extraFieldBuffer.length) {
            throw new Error('extra field length exceeds extra field buffer size');
          }
          rawEntry.extraFields.push({
            id: headerId,
            data: extraFieldBuffer.slice(dataStart, dataEnd),
          });
          i = dataEnd;
        }

        // 46+n+m - File comment
        rawEntry.commentBytes = data.slice(fileCommentStart, fileCommentStart + rawEntry.fileCommentLength);
        rawEntry.comment = decodeBuffer(rawEntry.commentBytes);

        readEntryCursor += data.length;

        if (rawEntry.uncompressedSize            === 0xffffffff ||
            rawEntry.compressedSize              === 0xffffffff ||
            rawEntry.relativeOffsetOfLocalHeader === 0xffffffff) {
          // ZIP64 format
          // find the Zip64 Extended Information Extra Field
          const zip64ExtraField = rawEntry.extraFields.find(e => e.id === 0x0001);
          if (!zip64ExtraField) {
            return new Error('expected zip64 extended information extra field');
          }
          const zip64EiefBuffer = zip64ExtraField.data;
          let index = 0;
          // 0 - Original Size          8 bytes
          if (rawEntry.uncompressedSize === 0xffffffff) {
            if (index + 8 > zip64EiefBuffer.length) {
              throw new Error('zip64 extended information extra field does not include uncompressed size');
            }
            rawEntry.uncompressedSize = getUint64LE(zip64EiefBuffer, index);
            index += 8;
          }
          // 8 - Compressed Size        8 bytes
          if (rawEntry.compressedSize === 0xffffffff) {
            if (index + 8 > zip64EiefBuffer.length) {
              throw new Error('zip64 extended information extra field does not include compressed size');
            }
            rawEntry.compressedSize = getUint64LE(zip64EiefBuffer, index);
            index += 8;
          }
          // 16 - Relative Header Offset 8 bytes
          if (rawEntry.relativeOffsetOfLocalHeader === 0xffffffff) {
            if (index + 8 > zip64EiefBuffer.length) {
              throw new Error('zip64 extended information extra field does not include relative header offset');
            }
            rawEntry.relativeOffsetOfLocalHeader = getUint64LE(zip64EiefBuffer, index);
            index += 8;
          }
          // 24 - Disk Start Number      4 bytes
        }

        // check for Info-ZIP Unicode Path Extra Field (0x7075)
        // see https://github.com/thejoshwolfe/yauzl/issues/33
        const nameField = rawEntry.extraFields.find(e =>
            e.id === 0x7075 &&
            e.data.length >= 6 && // too short to be meaningful
            e.data[0] === 1 &&    // Version       1 byte      version of this extra field, currently 1
            getUint32LE(e.data, 1), crc$1.unsigned(rawEntry.nameBytes)); // NameCRC32     4 bytes     File Name Field CRC32 Checksum
                                                                       // > If the CRC check fails, this UTF-8 Path Extra Field should be
                                                                       // > ignored and the File Name field in the header should be used instead.
        if (nameField) {
            // UnicodeName Variable UTF-8 version of the entry File Name
            rawEntry.fileName = decodeBuffer(nameField.data.slice(5));
        }

        // validate file size
        if (rawEntry.compressionMethod === 0) {
          let expectedCompressedSize = rawEntry.uncompressedSize;
          if ((rawEntry.generalPurposeBitFlag & 0x1) !== 0) {
            // traditional encryption prefixes the file data with a header
            expectedCompressedSize += 12;
          }
          if (rawEntry.compressedSize !== expectedCompressedSize) {
            throw new Error(`compressed size mismatch for stored file: ${rawEntry.compressedSize} != ${expectedCompressedSize}`);
          }
        }
        rawEntries.push(rawEntry);
      }
      const zip = {
        comment,
        commentBytes,
      };
      return {
        zip,
        entries: rawEntries.map(e => new ZipEntry(reader, e)),
      };
    }

    async function readEntryDataHeader(reader, rawEntry) {
      if (rawEntry.generalPurposeBitFlag & 0x1) {
        throw new Error('encrypted entries not supported');
      }
      const buffer = await readAs(reader, rawEntry.relativeOffsetOfLocalHeader, 30);
      // note: maybe this should be passed in or cached on entry
      // as it's async so there will be at least one tick (not sure about that)
      const totalLength = await reader.getLength();

      // 0 - Local file header signature = 0x04034b50
      const signature = getUint32LE(buffer, 0);
      if (signature !== 0x04034b50) {
        throw new Error(`invalid local file header signature: 0x${signature.toString(16)}`);
      }

      // all this should be redundant
      // 4 - Version needed to extract (minimum)
      // 6 - General purpose bit flag
      // 8 - Compression method
      // 10 - File last modification time
      // 12 - File last modification date
      // 14 - CRC-32
      // 18 - Compressed size
      // 22 - Uncompressed size
      // 26 - File name length (n)
      const fileNameLength = getUint16LE(buffer, 26);
      // 28 - Extra field length (m)
      const extraFieldLength = getUint16LE(buffer, 28);
      // 30 - File name
      // 30+n - Extra field
      const localFileHeaderEnd = rawEntry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
      let decompress;
      if (rawEntry.compressionMethod === 0) {
        // 0 - The file is stored (no compression)
        decompress = false;
      } else if (rawEntry.compressionMethod === 8) {
        // 8 - The file is Deflated
        decompress = true;
      } else {
        throw new Error(`unsupported compression method: ${rawEntry.compressionMethod}`);
      }
      const fileDataStart = localFileHeaderEnd;
      const fileDataEnd = fileDataStart + rawEntry.compressedSize;
      if (rawEntry.compressedSize !== 0) {
        // bounds check now, because the read streams will probably not complain loud enough.
        // since we're dealing with an unsigned offset plus an unsigned size,
        // we only have 1 thing to check for.
        if (fileDataEnd > totalLength) {
          throw new Error(`file data overflows file bounds: ${fileDataStart} +  ${rawEntry.compressedSize}  > ${totalLength}`);
        }
      }
      return {
        decompress,
        fileDataStart,
      };
    }

    async function readEntryDataAsArrayBuffer(reader, rawEntry) {
      const {decompress, fileDataStart} = await readEntryDataHeader(reader, rawEntry);
      if (!decompress) {
        const dataView = await readAs(reader, fileDataStart, rawEntry.compressedSize);
        // make copy?
        //
        // 1. The source is a Blob/file. In this case we'll get back TypedArray we can just hand to the user
        // 2. The source is a TypedArray. In this case we'll get back TypedArray that is a view into a larger buffer
        //    but because ultimately this is used to return an ArrayBuffer to `someEntry.arrayBuffer()`
        //    we need to return copy since we need the `ArrayBuffer`, not the TypedArray to exactly match the data.
        //    Note: We could add another API function `bytes()` or something that returned a `Uint8Array`
        //    instead of an `ArrayBuffer`. This would let us skip a copy here. But this case only happens for uncompressed
        //    data. That seems like a rare enough case that adding a new API is not worth it? Or is it? A zip of jpegs or mp3s
        //    might not be compressed. For now that's a TBD.
        return isTypedArraySameAsArrayBuffer(dataView) ? dataView.buffer : dataView.slice().buffer;
      }
      // see comment in readEntryDateAsBlob
      const typedArrayOrBlob = await readAsBlobOrTypedArray(reader, fileDataStart, rawEntry.compressedSize);
      const result = await inflateRawAsync(typedArrayOrBlob, rawEntry.uncompressedSize);
      return result;
    }

    async function readEntryDataAsBlob(reader, rawEntry, type) {
      const {decompress, fileDataStart} = await readEntryDataHeader(reader, rawEntry);
      if (!decompress) {
        const typedArrayOrBlob = await readAsBlobOrTypedArray(reader, fileDataStart, rawEntry.compressedSize, type);
        if (isBlob(typedArrayOrBlob)) {
          return typedArrayOrBlob;
        }
        return new Blob([isSharedArrayBuffer(typedArrayOrBlob.buffer) ? new Uint8Array(typedArrayOrBlob) : typedArrayOrBlob], {type});
      }
      // Here's the issue with this mess (should refactor?)
      // if the source is a blob then we really want to pass a blob to inflateRawAsync to avoid a large
      // copy if we're going to a worker.
      const typedArrayOrBlob = await readAsBlobOrTypedArray(reader, fileDataStart, rawEntry.compressedSize);
      const result = await inflateRawAsync(typedArrayOrBlob, rawEntry.uncompressedSize, type);
      return result;
    }

    async function unzipRaw(source) {
      let reader;
      if (typeof Blob !== 'undefined' && source instanceof Blob) {
        reader = new BlobReader(source);
      } else if (source instanceof ArrayBuffer || (source && source.buffer && source.buffer instanceof ArrayBuffer)) {
        reader = new ArrayBufferReader(source);
      } else if (isSharedArrayBuffer(source) || isSharedArrayBuffer(source.buffer)) {
        reader = new ArrayBufferReader(source);
      } else if (typeof source === 'string') {
        const req = await fetch(source);
        if (!req.ok) {
          throw new Error(`failed http request ${source}, status: ${req.status}: ${req.statusText}`);
        }
        const blob = await req.blob();
        reader = new BlobReader(blob);
      } else if (typeof source.getLength === 'function' && typeof source.read === 'function') {
        reader = source;
      } else {
        throw new Error('unsupported source type');
      }

      const totalLength = await reader.getLength();

      if (totalLength > Number.MAX_SAFE_INTEGER) {
        throw new Error(`file too large. size: ${totalLength}. Only file sizes up 4503599627370496 bytes are supported`);
      }

      return await findEndOfCentralDirector(reader, totalLength);
    }

    // If the names are not utf8 you should use unzipitRaw
    async function unzip(source) {
      const {zip, entries} = await unzipRaw(source);
      return {
        zip,
        entries: Object.fromEntries(entries.map(v => [v.name, v])),
      };
    }

    /* src\modules\Page.svelte generated by Svelte v3.42.5 */
    const file_1 = "src\\modules\\Page.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "view");
    			attr_dev(img, "class", "w-full svelte-1txwhzm");
    			toggle_class(img, "transition", /*transition*/ ctx[3]);
    			toggle_class(img, "position-absolute", /*options*/ ctx[0].mode !== 'vertical');
    			toggle_class(img, "h-full", /*options*/ ctx[0].mode === 'fit');
    			add_location(img, file_1, 126, 2, 3372);
    			attr_dev(div, "class", "w-full overflow-hidden position-relative dragarea d-flex justify-content-center flex-column transition svelte-1txwhzm");
    			toggle_class(div, "overflow-y-auto", /*options*/ ctx[0].mode === 'cover');
    			toggle_class(div, "pad", /*options*/ ctx[0].pad);
    			add_location(div, file_1, 116, 0, 2996);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			/*img_binding*/ ctx[13](img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img, "load", /*handleImage*/ ctx[9], false, false, false),
    					listen_dev(div, "pointerdown", /*dragStart*/ ctx[4], false, false, false),
    					listen_dev(div, "pointerup", /*dragEnd*/ ctx[5], false, false, false),
    					listen_dev(div, "wheel", /*handleZoom*/ ctx[8], { passive: true }, false, false),
    					listen_dev(div, "touchend", /*dragEnd*/ ctx[5], false, false, false),
    					listen_dev(div, "touchstart", /*checkPinch*/ ctx[6], false, false, false),
    					listen_dev(div, "touchmove", /*handlePinch*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 4 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*transition*/ 8) {
    				toggle_class(img, "transition", /*transition*/ ctx[3]);
    			}

    			if (dirty & /*options*/ 1) {
    				toggle_class(img, "position-absolute", /*options*/ ctx[0].mode !== 'vertical');
    			}

    			if (dirty & /*options*/ 1) {
    				toggle_class(img, "h-full", /*options*/ ctx[0].mode === 'fit');
    			}

    			if (dirty & /*options*/ 1) {
    				toggle_class(div, "overflow-y-auto", /*options*/ ctx[0].mode === 'cover');
    			}

    			if (dirty & /*options*/ 1) {
    				toggle_class(div, "pad", /*options*/ ctx[0].pad);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*img_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	let { file = null } = $$props;

    	async function updateFile(file) {
    		const blob = await file.blob();
    		$$invalidate(2, src = URL.createObjectURL(blob));
    	}

    	onDestroy(() => {
    		URL.revokeObjectURL(src);
    	});

    	let { options = {} } = $$props;
    	let image = null;
    	let src = null;
    	let scale = 0;
    	let transition = true;
    	const initial = { x: 0, y: 0 };
    	const old = { x: 0, y: 0 };
    	const position = { x: 0, y: 0 };
    	let disPos = initial;
    	const dimensions = { x: null, y: null };

    	// dragging around
    	function dragStart(e) {
    		if (options.mode === 'fit') {
    			$$invalidate(3, transition = false);
    			initial.x = e.clientX;
    			initial.y = e.clientY;
    			$$invalidate(1, image.onpointermove = handleDrag, image);
    			if (e.pointerId) image.setPointerCapture(e.pointerId);
    		}
    	}

    	function dragEnd(e) {
    		if (image.onpointermove) {
    			$$invalidate(3, transition = true);
    			$$invalidate(1, image.onpointermove = null, image);
    			if (e.pointerId) image.releasePointerCapture(e.pointerId);

    			if (pinching) {
    				pinching = false;
    				lasthypot = 0;
    			} else {
    				old.x += e.clientX - initial.x;
    				old.y += e.clientY - initial.y;
    			}
    		}
    	}

    	function handleDrag(e) {
    		if (!pinching) {
    			position.x = old.x + e.clientX - initial.x;
    			position.y = old.y + e.clientY - initial.y;
    			$$invalidate(11, disPos = position);
    		}
    	}

    	// zooming
    	let pinching = false;

    	function checkPinch({ touches }) {
    		if (options.mode === 'fit') {
    			if (touches.length === 2) {
    				pinching = true;
    				$$invalidate(3, transition = true);
    			}
    		}
    	}

    	let lasthypot = 0;
    	let hypotdelta = 0;

    	function handlePinch({ touches }) {
    		if (touches.length === 2 && pinching === true) {
    			const last = lasthypot;
    			lasthypot = Math.hypot(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
    			hypotdelta += last - lasthypot;

    			if (hypotdelta > 20 || hypotdelta < -20) {
    				handleZoom({ deltaY: hypotdelta > 0 ? 100 : -100 });
    				hypotdelta = 0;
    			}
    		}
    	}

    	let zoom = 1;

    	function handleZoom({ deltaY }) {
    		if (options.mode === 'fit') {
    			const diff = deltaY * -0.01;

    			if (diff < 0) {
    				if (!(scale < -4)) scale -= 0.5;
    				old.x /= 1.5;
    				old.y /= 1.5;
    			} else if (diff > 0 && !(scale > 11)) {
    				scale += 0.5;
    				old.x *= 1.5;
    				old.y *= 1.5;
    			}

    			$$invalidate(12, zoom = 2 ** scale);
    			$$invalidate(11, disPos = old);
    		}
    	}

    	function resetPos() {
    		old.x = 0;
    		old.y = 0;
    		scale = 0;
    		$$invalidate(12, zoom = 1);
    		$$invalidate(11, disPos = old);
    	}

    	function handleStyle({ disPos, zoom }) {
    		image?.style.setProperty('transform', `scale(${zoom})`);
    		image?.style.setProperty('--left', disPos.x + 'px');
    		image?.style.setProperty('--top', disPos.y + 'px');
    	}

    	function handleImage() {
    		dimensions.x = image.naturalWidth;
    		dimensions.y = image.naturalHeight;
    	}

    	const writable_props = ['file', 'options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			image = $$value;
    			$$invalidate(1, image);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('file' in $$props) $$invalidate(10, file = $$props.file);
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		file,
    		updateFile,
    		options,
    		image,
    		src,
    		scale,
    		transition,
    		initial,
    		old,
    		position,
    		disPos,
    		dimensions,
    		dragStart,
    		dragEnd,
    		handleDrag,
    		pinching,
    		checkPinch,
    		lasthypot,
    		hypotdelta,
    		handlePinch,
    		zoom,
    		handleZoom,
    		resetPos,
    		handleStyle,
    		handleImage
    	});

    	$$self.$inject_state = $$props => {
    		if ('file' in $$props) $$invalidate(10, file = $$props.file);
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    		if ('image' in $$props) $$invalidate(1, image = $$props.image);
    		if ('src' in $$props) $$invalidate(2, src = $$props.src);
    		if ('scale' in $$props) scale = $$props.scale;
    		if ('transition' in $$props) $$invalidate(3, transition = $$props.transition);
    		if ('disPos' in $$props) $$invalidate(11, disPos = $$props.disPos);
    		if ('pinching' in $$props) pinching = $$props.pinching;
    		if ('lasthypot' in $$props) lasthypot = $$props.lasthypot;
    		if ('hypotdelta' in $$props) hypotdelta = $$props.hypotdelta;
    		if ('zoom' in $$props) $$invalidate(12, zoom = $$props.zoom);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*file*/ 1024) {
    			updateFile(file);
    		}

    		if ($$self.$$.dirty & /*options*/ 1) {
    			resetPos();
    		}

    		if ($$self.$$.dirty & /*disPos, zoom*/ 6144) {
    			handleStyle({ disPos, zoom });
    		}
    	};

    	return [
    		options,
    		image,
    		src,
    		transition,
    		dragStart,
    		dragEnd,
    		checkPinch,
    		handlePinch,
    		handleZoom,
    		handleImage,
    		file,
    		disPos,
    		zoom,
    		img_binding
    	];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { file: 10, options: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get file() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.5 */

    const { Object: Object_1, window: window_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (57:2) {#each pages as file}
    function create_each_block(ctx) {
    	let page_1;
    	let updating_options;
    	let current;

    	function page_1_options_binding(value) {
    		/*page_1_options_binding*/ ctx[11](value);
    	}

    	let page_1_props = { file: /*file*/ ctx[19] };

    	if (/*options*/ ctx[2] !== void 0) {
    		page_1_props.options = /*options*/ ctx[2];
    	}

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(page_1, 'options', page_1_options_binding));

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const page_1_changes = {};
    			if (dirty & /*pages*/ 2) page_1_changes.file = /*file*/ ctx[19];

    			if (!updating_options && dirty & /*options*/ 4) {
    				updating_options = true;
    				page_1_changes.options = /*options*/ ctx[2];
    				add_flush_callback(() => updating_options = false);
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:2) {#each pages as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let installprompt;
    	let t0;
    	let div1;
    	let div1_style_value;
    	let t1;
    	let div5;
    	let div2;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let div3;
    	let button2;
    	let t7;
    	let button3;
    	let t9;
    	let button4;
    	let t11;
    	let div4;
    	let button5;
    	let t12_value = (/*options*/ ctx[2].crop ? 'crop' : 'crop_free') + "";
    	let t12;
    	let t13;
    	let button6;
    	let t14_value = (/*options*/ ctx[2].pad ? 'crop_5_4' : 'crop_portrait') + "";
    	let t14;
    	let t15;
    	let title_value;
    	let current;
    	let mounted;
    	let dispose;
    	installprompt = new InstallPrompt({ $$inline: true });
    	let each_value = /*pages*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	document.title = title_value = /*name*/ ctx[0];

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(installprompt.$$.fragment);
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "arrow_back";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "arrow_forward";
    			t5 = space();
    			div3 = element("div");
    			button2 = element("button");
    			button2.textContent = "zoom_out_map";
    			t7 = space();
    			button3 = element("button");
    			button3.textContent = "expand";
    			t9 = space();
    			button4 = element("button");
    			button4.textContent = "height";
    			t11 = space();
    			div4 = element("div");
    			button5 = element("button");
    			t12 = text(t12_value);
    			t13 = space();
    			button6 = element("button");
    			t14 = text(t14_value);
    			t15 = space();
    			attr_dev(div0, "class", "sticky-alerts d-flex flex-column-reverse svelte-15in3i5");
    			add_location(div0, file, 48, 0, 1276);
    			attr_dev(div1, "class", "h-full w-full pages-wrapper svelte-15in3i5");

    			attr_dev(div1, "style", div1_style_value = /*options*/ ctx[2].mode !== 'vertical'
    			? `transform: translateX(${100 * /*page*/ ctx[3]}vw)`
    			: '');

    			toggle_class(div1, "overflow-y-auto", /*options*/ ctx[2].mode === 'vertical');
    			toggle_class(div1, "single", /*options*/ ctx[2].mode !== 'vertical');
    			add_location(div1, file, 51, 0, 1358);
    			attr_dev(button0, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 63, 4, 1810);
    			attr_dev(button1, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 64, 4, 1917);
    			attr_dev(div2, "class", "btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto");
    			add_location(div2, file, 62, 2, 1738);
    			attr_dev(button2, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file, 74, 4, 2738);
    			attr_dev(button3, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button3, "type", "button");
    			add_location(button3, file, 75, 4, 2871);
    			attr_dev(button4, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button4, "type", "button");
    			add_location(button4, file, 76, 4, 3000);
    			attr_dev(div3, "class", "btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto");
    			add_location(div3, file, 73, 2, 2666);
    			attr_dev(button5, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button5, "type", "button");
    			add_location(button5, file, 79, 4, 3211);
    			attr_dev(button6, "class", "btn btn-lg btn-square material-icons");
    			attr_dev(button6, "type", "button");
    			add_location(button6, file, 80, 4, 3377);
    			attr_dev(div4, "class", "btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto");
    			add_location(div4, file, 78, 2, 3139);
    			attr_dev(div5, "class", "position-absolute buttons row w-full justify-content-center svelte-15in3i5");
    			add_location(div5, file, 61, 0, 1662);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(installprompt, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t3);
    			append_dev(div2, button1);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, button2);
    			append_dev(div3, t7);
    			append_dev(div3, button3);
    			append_dev(div3, t9);
    			append_dev(div3, button4);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, button5);
    			append_dev(button5, t12);
    			append_dev(div4, t13);
    			append_dev(div4, button6);
    			append_dev(button6, t14);
    			insert_dev(target, t15, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "drop", prevent_default(/*handleInput*/ ctx[6]), false, true, false),
    					listen_dev(window_1, "dragenter", prevent_default(/*dragenter_handler*/ ctx[7]), false, true, false),
    					listen_dev(window_1, "dragover", prevent_default(/*dragover_handler*/ ctx[8]), false, true, false),
    					listen_dev(window_1, "dragstart", prevent_default(/*dragstart_handler*/ ctx[9]), false, true, false),
    					listen_dev(window_1, "dragleave", prevent_default(/*dragleave_handler*/ ctx[10]), false, true, false),
    					listen_dev(window_1, "paste", prevent_default(/*handleInput*/ ctx[6]), false, true, false),
    					listen_dev(button0, "click", /*next*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*last*/ ctx[5], false, false, false),
    					listen_dev(button2, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(button3, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(button4, "click", /*click_handler_2*/ ctx[14], false, false, false),
    					listen_dev(button5, "click", /*click_handler_3*/ ctx[15], false, false, false),
    					listen_dev(button6, "click", /*click_handler_4*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pages, options*/ 6) {
    				each_value = /*pages*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*options, page*/ 12 && div1_style_value !== (div1_style_value = /*options*/ ctx[2].mode !== 'vertical'
    			? `transform: translateX(${100 * /*page*/ ctx[3]}vw)`
    			: '')) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (dirty & /*options*/ 4) {
    				toggle_class(div1, "overflow-y-auto", /*options*/ ctx[2].mode === 'vertical');
    			}

    			if (dirty & /*options*/ 4) {
    				toggle_class(div1, "single", /*options*/ ctx[2].mode !== 'vertical');
    			}

    			if ((!current || dirty & /*options*/ 4) && t12_value !== (t12_value = (/*options*/ ctx[2].crop ? 'crop' : 'crop_free') + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*options*/ 4) && t14_value !== (t14_value = (/*options*/ ctx[2].pad ? 'crop_5_4' : 'crop_portrait') + "")) set_data_dev(t14, t14_value);

    			if ((!current || dirty & /*name*/ 1) && title_value !== (title_value = /*name*/ ctx[0])) {
    				document.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(installprompt.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(installprompt.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(installprompt);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t15);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let name = 'Manga Reader';
    	let pages = [];
    	let options = { mode: 'cover', crop: true, pad: false };
    	let page = 0;

    	function next() {
    		$$invalidate(3, page = Math.min(pages.length - 1, page + 1));
    	}

    	function last() {
    		$$invalidate(3, page = Math.max(page - 1, 0));
    	}

    	navigator.serviceWorker.register('/sw.js');

    	// loading files
    	async function handleInput({ dataTransfer, clipboardData }) {
    		const items = clipboardData?.items || dataTransfer?.items;

    		if (items) {
    			handleFiles(await handleItems(items, ['book']));
    		}
    	}

    	if ('launchQueue' in window) {
    		getLaunchFiles().then(handleFiles);
    	}

    	async function handlePopup() {
    		if (!files.length) {
    			handleFiles(await filePopup(['book']));
    		}
    	}

    	async function handleFiles(newfiles) {
    		if (newfiles?.length) {
    			$$invalidate(1, pages = Object.values((await unzip(newfiles[0])).entries).filter(page => !page.isDirectory));
    			$$invalidate(0, name = newfiles[0].name.match(/([^-–]+)/)[0].trim());
    			$$invalidate(3, page = 0);
    		}
    	}

    	handleFiles(getSearchFiles(['book']));
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function dragenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragstart_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dragleave_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function page_1_options_binding(value) {
    		options = value;
    		$$invalidate(2, options);
    	}

    	const click_handler = () => $$invalidate(2, options.mode = 'fit', options);
    	const click_handler_1 = () => $$invalidate(2, options.mode = 'cover', options);
    	const click_handler_2 = () => $$invalidate(2, options.mode = 'vertical', options);
    	const click_handler_3 = () => $$invalidate(2, options.crop = !options.crop, options);
    	const click_handler_4 = () => $$invalidate(2, options.pad = !options.pad, options);

    	$$self.$capture_state = () => ({
    		InstallPrompt,
    		filePopup,
    		handleItems,
    		getSearchFiles,
    		getLaunchFiles,
    		unzip,
    		Page,
    		name,
    		pages,
    		options,
    		page,
    		next,
    		last,
    		handleInput,
    		handlePopup,
    		handleFiles
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('pages' in $$props) $$invalidate(1, pages = $$props.pages);
    		if ('options' in $$props) $$invalidate(2, options = $$props.options);
    		if ('page' in $$props) $$invalidate(3, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		pages,
    		options,
    		page,
    		next,
    		last,
    		handleInput,
    		dragenter_handler,
    		dragover_handler,
    		dragstart_handler,
    		dragleave_handler,
    		page_1_options_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map