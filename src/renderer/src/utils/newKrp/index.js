export function addHotspot(krpano, curHs) {
    console.log(curHs);
    
    krpano.events.addListener("onclick", () => {
        const hs = krpano.addhotspot('demo_hs1')
        const p = krpano.screentosphere(krpano.mouse.x, krpano.mouse.y);
        hs.setvars({
            distorted: false, dragging: true, renderer: 'webgl',
            url: curHs.url, ath: p.x, atv: p.y,
            scale: 1, alpha: 1, zorder: 1,
        })
    })
}