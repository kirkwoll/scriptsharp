///////////////////////////////////////////////////////////////////////////////
// Activator
ss.Activator = function#? DEBUG Activator$##() {
}

ss.Activator.createInstance = function#? DEBUG Activator$createInstance##(type) {
    var args = Array.prototype.slice.call(arguments);                                                                                    
    return new type.prototype.constructor(args.slice(1));
}

ss.Activator.registerClass('mscorlib', 'Activator');
