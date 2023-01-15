import { useState, useEffect, useRef } from 'react';
import { SupportedModels, createDetector, PoseDetector, Keypoint } from '@tensorflow-models/pose-detection';
import './App.css';
import { useAppDispatch } from './store/hooks';
import { setPoses, setProcent } from './store/slices/app';
import { store } from './store/store';

type TStatus = 'anilized' | 'ready' | 'no-img';

const pidjak1 = [
  {
    key: 'left-sholder',
    x: 536,
    y: 105
  },
  {
    key: 'right-sholder',
    x: 128,
    y: 120
  },
  {
    key: 'left-bottom',
    x: 478,
    y: 665
  },
  {
    key: 'right-bottom',
    x: 182,
    y: 665
  }
];

function App() {
  const model = SupportedModels.MoveNet;

  const [detector, setDetector] = useState<PoseDetector | null>(null);
  const [status, setStatus] = useState<TStatus>('no-img');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const canvasEl = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    //initDetector();

    let h = Math.round(window.screen.availHeight * 0.82);
    if (h < 550) {
      h = 550;
    }
    //const w = 
    //setWidth(h);
    setHeight(h);
    initDetector();
    //renderPidjack();
  }, []);

  const initDetector = async () => {
    try {
      const d = await createDetector(model);
      setDetector(d);
    } catch (error) {
      alert('Yuor brouser not soported WebGL version 1 or WebGL version 2!');
    }
  };

  const onChangeImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const img = new Image();
      setStatus('anilized');
      img.onload = async () => {
        //Scene.addImage(img);
        await renderImg(img);
        URL.revokeObjectURL(img.src);

        const poses = await detector!.estimatePoses(img);

        dispatch(setPoses(poses[0].keypoints));
        renderDots(poses[0].keypoints);
        renderPidjack();
        setStatus('ready');
        //console.log('poses = ', poses[0].keypoints);
      };

      img.src = URL.createObjectURL(files[0]);

    }
  };

  const resize = (img: HTMLImageElement, w: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    let currentW = img.width;
    let currentH = img.height;

    canvas.width = currentW;
    canvas.height = currentH;
    let prevW = currentW;
    let prevH = currentH;

    ctx.drawImage(img, 0, 0, img.width, img.height);
    //document.body.append(canvas);
    while (currentW * 0.7 > w) {

      currentW = Math.floor(currentW * 0.7);
      currentH = Math.floor(currentH * 0.7);
      ctx.drawImage(canvas, 0, 0, prevW, prevH, 0, 0, currentW, currentH);
      prevH = currentH;
      prevW = currentW;
      //oc = secResize(canvas);
    }
    //canvas.width = currentW;
    //canvas.height = currentH;
    //canvas.getContext('2d')!.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0,0, w, h);

    return { oc: canvas, currentW, currentH };
  };

  const secResize = (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, _) => {
      const oc = document.createElement('canvas');
      const ctx = oc.getContext('2d')!;
      let currentW = canvas.width * 0.5;
      let currentH = canvas.height * 0.5;
      console.log('currentW = ', canvas.width);
      oc.width = currentW;
      oc.height = currentH;

      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, currentW, currentH);
      //document.body.append(oc);
      resolve(oc);
      //return oc;
    });

  }

  const resize2 = async (img: HTMLImageElement, w: number) => {
    let canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    //document.body.append(canvas);
    const num = 20;
    console.log('num = ', num);
    const arr = new Array(num);

    let i = 0;
    for (const _ of arr) {
      if (canvas.width * 0.5 < w) {
        return canvas;
      }

      canvas = await secResize(canvas);

    }
    console.log('return');
    //return arrCanvas[arrCanvas.length-1];
    return canvas;
  }

  const renderImg = (img: HTMLImageElement) => {
    return new Promise<void>(async (resolve) => {
      const canvas = canvasEl.current!;
      const oWidth = img.width;
      const oHeight = img.height;

      let w = oWidth;
      let h = oHeight;
      let proc = 1;
      if (oHeight > height) {
        h = height;
        proc = height / oHeight;
        //setProcent(proc);
        w = oWidth * proc;
      }
      //img.width = w;
      //img.height = h;
      dispatch(setProcent(proc));
      canvas.width = w;
      canvas.height = h;
      console.log(w, '||', h);
      // canvas.width = oWidth;
      // canvas.height = oHeight;

      const ctx = canvas.getContext('2d')!;
      //const {oc,currentW,currentH} = resize(img, w);
      //ctx.drawImage(oc, 0, 0, currentW, currentH, 0, 0, w, h);
      const oc = await resize2(img, w);
      ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, w, h);

      setTimeout(()=>resolve(),1);
    });

    //return;

  };

  // const renderImg = (img: HTMLImageElement): Promise<void> => {
  //   return new Promise((resolve, _) => {
  //     const canvas = canvasEl.current!;
  //     const oWidth = img.width;
  //     const oHeight = img.height;

  //     let w = oWidth;
  //     let h = oHeight;
  //     let proc = 1;
  //     if(oHeight>height){
  //       h = height;
  //       proc = height/oHeight;
  //       //setProcent(proc);
  //       w = oWidth*proc;
  //     }
  //     //img.width = w;
  //     //img.height = h;
  //     dispatch(setProcent(proc));
  //     canvas.width = w;
  //     canvas.height = h;
  //     console.log(w,'||',h);
  //     // canvas.width = oWidth;
  //     // canvas.height = oHeight;

  //     const ctx = canvas.getContext('2d')!;
  //     //const {oc,currentW,currentH} = resize(img, w);
  //     ctx.drawImage(img, 0, 0, w, h);
  //     //const oc = await resize2(img,w);
  //     //ctx.drawImage(oc, 0, 0, currentW, currentH, 0, 0, w, h);

  //     setImmediate(()=>resolve());

  //   });
  // };

  const renderDots = (arrDots: Keypoint[]) => {
    const proc = store.getState().app.procent;
    console.log('from store = ', store.getState().app.procent);
    const canvas = canvasEl.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    arrDots.forEach(dot => {
      //if(dot.name==='left_hip'){
      ctx.fillRect(dot.x * proc - 3, dot.y * proc - 3, 6, 6);
      //}

    });

  }

  const renderPidjack = () => {
    const posesDots = store.getState().app.poses;
    console.log('posesDots = ', posesDots);
    // 5left_shoulder
    // 6right_shoulder
    // 11left_hip
    // 12right_hip
    const proc = store.getState().app.procent;
    const a = { x: posesDots[12].x * proc, y: posesDots[12].y * proc };
    const b = { x: posesDots[6].x * proc, y: posesDots[6].y * proc };
    const c = { x: posesDots[5].x * proc, y: posesDots[5].y * proc };
    const d = { x: posesDots[11].x * proc, y: posesDots[11].y * proc };

    // const s1 = (1/2)*Math.abs((b.x-a.x)*(c.y-a.y)-(c.x-a.y)*(b.y-a.y));
    // const s2 = (1/2)*Math.abs((c.x-a.x)*(d.y-a.y)-(d.x-a.y)*(c.y-a.y));
    // const xm1 = (a.x+b.x+c.x)/3;
    // const ym1 = (a.y+b.y+c.y)/3;
    // const xm2 = (a.x+c.x+d.x)/3;
    // const ym2 = (a.y+c.y+d.y)/3;
    // const x1 = (s1*xm1+s2*xm2)/(s1+s2);
    // const y1 = (s1*ym1+s2*ym2)/(s1+s2);

    const cx = ((b.x - d.x) * (a.y - d.y) - (b.y - d.y) * (a.x - d.x)) / ((b.y - d.y) * (c.x - a.x) - (b.x - d.x) * (c.y - a.y));
    const cy = ((c.x - a.x) * (a.y - d.y) - (c.y - a.y) * (a.x - d.x)) / ((b.y - d.y) * (c.x - a.x) - (b.x - d.x) * (c.y - a.y));

    const x1 = a.x + cx * (c.x - a.x);
    const y1 = a.y + cy * (c.y - a.y);
    const canvas = canvasEl.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';

    ctx.fillRect(x1 - 3, y1 - 3, 6, 6);

    //ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(c.x, c.y);
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();

    // 0left_shoulder
    // 1right_shoulder
    // 2left_hip
    // 3right_hip
    const a1 = { x: pidjak1[3].x, y: pidjak1[3].y };
    const b1 = { x: pidjak1[1].x, y: pidjak1[1].y };
    const c1 = { x: pidjak1[0].x, y: pidjak1[0].y };
    const d1 = { x: pidjak1[2].x, y: pidjak1[2].y };

    const cx1 = ((b1.x - d1.x) * (a1.y - d1.y) - (b1.y - d1.y) * (a1.x - d1.x)) / ((b1.y - d1.y) * (c1.x - a1.x) - (b1.x - d1.x) * (c1.y - a1.y));
    const cy1 = ((c1.x - a1.x) * (a1.y - d1.y) - (c1.y - a1.y) * (a1.x - d1.x)) / ((b1.y - d1.y) * (c1.x - a1.x) - (b1.x - d1.x) * (c1.y - a1.y));

    const x2 = a1.x + cx1 * (c1.x - a1.x);
    const y2 = a1.y + cy1 * (c1.y - a1.y);

    // const raznX = x2-x1;
    // const raznY = y2-y1;

    const la = Math.sqrt(Math.pow((x1 - a.x), 2) + Math.pow((y1 - a.y), 2));
    const lb = Math.sqrt(Math.pow((x1 - b.x), 2) + Math.pow((y1 - b.y), 2));
    const lc = Math.sqrt(Math.pow((x1 - c.x), 2) + Math.pow((y1 - c.y), 2));
    const ld = Math.sqrt(Math.pow((x1 - d.x), 2) + Math.pow((y1 - d.y), 2));

    console.log(la, '||', lb, '||', lc, '||', ld);

    const la1 = Math.sqrt(Math.pow((x2 - a1.x), 2) + Math.pow((y2 - a1.y), 2));
    const lb1 = Math.sqrt(Math.pow((x2 - b1.x), 2) + Math.pow((y2 - b1.y), 2));
    const lc1 = Math.sqrt(Math.pow((x2 - c1.x), 2) + Math.pow((y2 - c1.y), 2));
    const ld1 = Math.sqrt(Math.pow((x2 - d1.x), 2) + Math.pow((y2 - d1.y), 2));

    console.log(la1, '||', lb1, '||', lc1, '||', ld1);

    //const midlL = ((la1-la)+(lb1-lb)+(lc1-lc)+(ld1-ld))/4;
    //const midlL = Math.max((la1-la),(lb1-lb),(lc1-lc),(ld1-ld));


    const img = new Image();
    //setStatus('anilized');
    img.onload = async () => {
      // const l1 = Math.sqrt(Math.pow((img.width/2-a1.x),2)+Math.pow((img.height/2-a1.y),2));
      // const l2 = Math.sqrt(Math.pow((img.width/2-b1.x),2)+Math.pow((img.height/2-b1.y),2));
      // const l3 = Math.sqrt(Math.pow((img.width/2-c1.x),2)+Math.pow((img.height/2-c1.y),2));
      // const l4 = Math.sqrt(Math.pow((img.width/2-d1.x),2)+Math.pow((img.height/2-d1.y),2));

      //console.log(l1,'||',l2,'||',l3,'||',l4);
      //const midlL = Math.max((la1-la),(lb1-lb),(lc1-lc),(ld1-ld));
      //const midlL = ((la1-la)+(lb1-lb)+(lc1-lc)+(ld1-ld))/4;
      //const midlL = (la+lb+lc+ld)/4;
      //console.log('midlL = ', midlL);
      // const l = (la1+lb1+lc1+ld1)/4;
      // console.log('l = ', l);
      //const proc1 = ((la1/la)+(lb1/lb)+(lc1/lc)+(ld1/ld))/4;
      const proc2 = Math.max((la / la1), (lb / lb1), (lc / lc1), (ld / ld1));
      const proc3 = ((la / la1) + (lb / lb1) + (lc / lc1) + (ld / ld1)) / 4;
      const proc5 = Math.min((la / la1), (lb / lb1), (lc / lc1), (ld / ld1));
      const proc6 = (proc2 + proc5) / 2;
      const proc4 = (proc2 + proc3) / 2;
      console.log('proc3 = ', proc3);
      console.log('proc4 = ', proc4);
      console.log('proc5 = ', proc5);
      console.log('proc6 = ', proc6);
      //const proc1 = 0.41;
      const proc1 = proc2;
      console.log('by proc1 = ', (Math.abs(la - (proc1 * la1)) + Math.abs(lb - (proc1 * lb1)) + Math.abs(lc - (proc1 * lc1)) + Math.abs(ld - (proc1 * ld1))) / 4);
      console.log('by proc3 = ', (Math.abs(la - (proc3 * la1)) + Math.abs(lb - (proc3 * lb1)) + Math.abs(lc - (proc3 * lc1)) + Math.abs(ld - (proc3 * ld1))) / 4);
      console.log('by proc2 = ', (Math.abs(la - (proc2 * la1)) + Math.abs(lb - (proc2 * lb1)) + Math.abs(lc - (proc2 * lc1)) + Math.abs(ld - (proc2 * ld1))) / 4);
      console.log('proc1 = ', proc1);

      console.log('proc2 = ', proc2);
      //const proc1 = 0.402;

      //const canvas = canvasEl.current!;
      //const ctx = canvas.getContext('2d')!;
      //console.log('img = ', img.width);
      //canvas.width = img.width;
      //canvas.height = img.height;

      //URL.revokeObjectURL(img.src);
      const raznX = x1 - x2 * proc1;
      const raznY = y1 - y2 * proc1;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, (0 + raznX), (0 + raznY), img.width * proc1, img.height * proc1);
      ctx.fillStyle = '#0ffa4e';
      pidjak1.forEach(dot => {
        ctx.fillRect((dot.x * proc1 + raznX) - 3, (dot.y * proc1 + raznY) - 3, 6, 6);
      });
      ctx.fillRect((x2 * proc1 + raznX) - 3, (y2 * proc1 + raznY) - 3, 6, 6);
      ctx.restore();
      //console.log('poses = ', poses[0].keypoints);
    };

    img.src = './assets/pidjac.png';

  };

  return (
    <div className="App">
      {
        (detector && status === "no-img") &&
        <>
          <input type="file" accept="image/png, image/jpeg" onChange={onChangeImg} />
        </>
      }
      {
        status !== "no-img" && <div>{status}</div>
      }
      <div className="mediaCont">
        {/* <img src="./assets/pngwing.com.png" alt="alice-wood.jpg" width={551} height={828}/> */}
        {/* <img src="./assets/metart_nude-look_alice-wood_high_0001.jpg" alt="alice-wood.jpg" width={552} height={828}/> */}
        <canvas ref={canvasEl}></canvas>
      </div>

    </div>
  );
}

export default App;
