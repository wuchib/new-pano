export function initKrapno(dom) {
    return new Promise((resolve, reject) => {
        if(!window.embedpano) reject(new Error("全景工具缺失"));
        
        window.embedpano({
            target: dom,
            xml: '/src/libs/krpano/krpano.xml',
            id: "krpanoSWFObject",
            bgcolor: "#1a1a1e",
            vars: null,
            initvars: null,
            basepath: null,
            cors: false,
            sameorigin: true,
            consolelog: false,
            mwheel: true,
            capturetouch: true,
            focus: true,
            webgl: true,
            webglsettings: { webgl2: true, depth: true, stencil: true },
            webxr: "auto",
            mobilescale: 1.0,
            safearea: "auto",
            touchdevicemousesupport: true,
            iosfullscreen: false,
            passQueryParameters: false,
            onready : function(krpano){ 
                resolve(krpano);
            }
        });
    })
}