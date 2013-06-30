///////////////////////////////////////////////////////////////////////////////
// Type System Implementation

global.Type = Function;
Type.__typeName = 'Type';

var __namespaces = {};
var __rootNamespaces = [];
var __assemblies = {};

function ns(name) {
    this.__typeName = name;
}
ns.prototype = {
    __namespace: true,
    getName: function() {
        return this.__typeName;
    }
}

Type.registerAssembly = function#? DEBUG Type$registerAssembly##(name) {
    if (__assemblies[name]) {
        return;
    }
                                                                           
    __assemblies[name] = new ss.Assembly(name);
}

Type.registerNamespace = function#? DEBUG Type$registerNamespace##(name) {
    if (__namespaces[name]) {
        return;
    }

    var nsi = global;
    var nameParts = name.split('.');

    for (var i = 0; i < nameParts.length; i++) {
        var part = nameParts[i];
        var nso = nsi[part];
        if (!nso) {
            nsi[part] = nso = new ns(nameParts.slice(0, i + 1).join('.'));
            if (i == 0) {
                __rootNamespaces.add(nso);
            }
        }
        nsi = nso;
    }

    __namespaces[name] = nsi;
}

Type.prototype.registerClass = function#? DEBUG Type$registerClass##(assemblyName, name, baseType, interfaceType) {
    Type.registerAssembly(assemblyName);
    this.__assembly = __assemblies[assemblyName];                                                                                                                  
    this.__assembly._types.push(this);
    this.prototype.constructor = this;
    this.__typeName = name;
    this.__class = true;
    this.__baseType = baseType || Object;
    if (baseType) {
        this.__basePrototypePending = true;
    }

    if (interfaceType) {
        this.__interfaces = [];
        for (var i = 2; i < arguments.length; i++) {
            interfaceType = arguments[i];
            this.__interfaces.add(interfaceType);
        }
    }
}

Type.prototype.registerInterface = function#? DEBUG Type$createInterface##(name) {
    this.__typeName = name;
    this.__interface = true;
}

Type.prototype.registerEnum = function#? DEBUG Type$createEnum##(name, flags) {
    for (var field in this.prototype) {
         this[field] = this.prototype[field];
    }

    this.__typeName = name;
    this.__enum = true;
    if (flags) {
        this.__flags = true;
    }
}

Type.prototype.setupBase = function#? DEBUG Type$setupBase##() {
    if (this.__basePrototypePending) {
        var baseType = this.__baseType;
        if (baseType.__basePrototypePending) {
            baseType.setupBase();
        }

        for (var memberName in baseType.prototype) {
            var memberValue = baseType.prototype[memberName];
            if (!this.prototype[memberName]) {
                this.prototype[memberName] = memberValue;
            }
        }

        delete this.__basePrototypePending;
    }
}

if (!Type.prototype.resolveInheritance) {
    // This function is not used by Script#; Visual Studio relies on it
    // for JavaScript IntelliSense support of derived types.
    Type.prototype.resolveInheritance = Type.prototype.setupBase;
}

Type.prototype.initializeBase = function#? DEBUG Type$initializeBase##(instance, args) {
    if (this.__basePrototypePending) {
        this.setupBase();
    }

    if (!args) {
        this.__baseType.apply(instance);
    }
    else {
        this.__baseType.apply(instance, args);
    }
}

Type.prototype.callBaseMethod = function#? DEBUG Type$callBaseMethod##(instance, name, args) {
    var baseMethod = this.__baseType.prototype[name];
    if (!args) {
        return baseMethod.apply(instance);
    }
    else {
        return baseMethod.apply(instance, args);
    }
}

Type.prototype.get_baseType = function#? DEBUG Type$get_baseType##() {
    return this.__baseType || null;
}

Type.prototype.get_fullName = function#? DEBUG Type$get_fullName##() {
    return this.__typeName;
}

Type.prototype.get_name = function#? DEBUG Type$get_name##() {
    var fullName = this.__typeName;
    var nsIndex = fullName.lastIndexOf('.');
    if (nsIndex > 0) {
        return fullName.substr(nsIndex + 1);
    }
    return fullName;
}

Type.prototype.get_assembly = function#? DEBUG Type$get_assembly##() {
    return this.__assembly;
}

Type.prototype.isInstanceOfType = function#? DEBUG Type$isInstanceOfType##(instance) {
    if (ss.isNullOrUndefined(instance)) {
        return false;
    }
    if ((this == Object) || (instance instanceof this)) {
        return true;
    }

    var type = Type.getInstanceType(instance);
    return this.isAssignableFrom(type);
}

Type.prototype.isAssignableFrom = function#? DEBUG Type$isAssignableFrom##(type) {
    if ((this == Object) || (this == type)) {
        return true;
    }
    if (this.__class) {
        var baseType = type.__baseType;
        while (baseType) {
            if (this == baseType) {
                return true;
            }
            baseType = baseType.__baseType;
        }
    }
    else if (this.__interface) {
        var interfaces = type.__interfaces;
        if (interfaces && interfaces.contains(this)) {
            return true;
        }

        var baseType = type.__baseType;
        while (baseType) {
            interfaces = baseType.__interfaces;
            if (interfaces && interfaces.contains(this)) {
                return true;
            }
            baseType = baseType.__baseType;
        }
    }
    return false;
}

Type.isClass = function#? DEBUG Type$isClass##(obj) {
    return (obj.__class == true);
}

Type.isInterface = function#? DEBUG Type$isInterface##(obj) {
    return (obj.__interface == true);
}

Type.canCast = function#? DEBUG Type$canCast##(instance, type) {
    return type.isInstanceOfType(instance);
}

Type.safeCast = function#? DEBUG Type$safeCast##(instance, type) {
    if (type.isInstanceOfType(instance)) {
        return instance;
    }
    return null;
}

Type.getInstanceType = function#? DEBUG Type$getInstanceType##(instance) {
    var ctor = null;

    // NOTE: We have to catch exceptions because the constructor
    //       cannot be looked up on native COM objects
    try {
        ctor = instance.constructor;
    }
    catch (ex) {
    }
    if (!ctor || !ctor.__typeName) {
        ctor = Object;
    }
    return ctor;
}

Type.getType = function#? DEBUG Type$getType##(typeName) {
    if (!typeName) {
        return null;
    }

    if (!Type.__typeCache) {
        Type.__typeCache = {};
    }

    var type = Type.__typeCache[typeName];
    if (!type) {
        type = eval(typeName);
        Type.__typeCache[typeName] = type;
    }
    return type;
}
