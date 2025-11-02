function createEventProxy(target) {
    const eventListeners = {};
  
    return new Proxy(target, {
      get(obj, prop) {
        // Event subscription methods
        if (prop === 'on') {
          return (event, listener) => {
            if (!eventListeners[event]) eventListeners[event] = [];
            eventListeners[event].push(listener);
          };
        }
        if (prop === 'off') {
          return (event, listener) => {
            if (eventListeners[event]) {
              const index = eventListeners[event].indexOf(listener);
              if (index !== -1) eventListeners[event].splice(index, 1);
            }
          };
        }
  
        // For all other properties/methods
        const value = obj[prop];
  
        if (typeof value === 'function') {
          return function (...args) {
            // Emit before event
            const beforeEvent = `before_${prop}`;
            if (eventListeners[beforeEvent]) {
              eventListeners[beforeEvent].forEach(fn => fn(...args));
            }
  
            // Call the original function
            const result = value.apply(obj, args);
  
            if (result && typeof result.then === 'function') {
              // Async
              return result.then(res => {
                const afterEvent = `after_${prop}`;
                const successEvent = `on_${prop}`;
  
                if (eventListeners[successEvent]) {
                  eventListeners[successEvent].forEach(fn => fn(res, ...args));
                }
                if (eventListeners[afterEvent]) {
                  eventListeners[afterEvent].forEach(fn => fn(res, ...args));
                }
  
                return res;
              });
            } else {
              // Sync
              const afterEvent = `after_${prop}`;
              const successEvent = `on_${prop}`;
  
              if (eventListeners[successEvent]) {
                eventListeners[successEvent].forEach(fn => fn(result, ...args));
              }
              if (eventListeners[afterEvent]) {
                eventListeners[afterEvent].forEach(fn => fn(result, ...args));
              }
  
              return result;
            }
          };
        }
  
        return value;
      }
    });
  }
  
  module.exports = createEventProxy;
  