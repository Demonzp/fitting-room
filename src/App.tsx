import { useState, useEffect, useRef } from 'react';
import { SupportedModels, createDetector, PoseDetector, Keypoint } from '@tensorflow-models/pose-detection';
import './App.css';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setProcent } from './store/slices/app';
import { store } from './store/store';

type TStatus = 'anilized' | 'ready' | 'no-img';

const pidjak1 = [
  {
    key: 'left-sholder',
    x: 546,
    y: 105
  },
  {
    key: 'right-sholder',
    x: 120,
    y: 120
  },
  {
    key: 'left-bottom',
    x: 480,
    y: 730
  },
  {
    key: 'right-bottom',
    x: 180,
    y: 730
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
    
    let h = Math.round(window.screen.availHeight*0.78);
    if(h<550){
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
        setStatus('ready');
        renderDots(poses[0].keypoints);
        //console.log('poses = ', poses[0].keypoints);
      };

      img.src = URL.createObjectURL(files[0]);

    }
  };

  const renderImg = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve, _) => {
      const canvas = canvasEl.current!;
      const oWidth = img.width;
      const oHeight = img.height;

      let w = oWidth;
      let h = oHeight;

      if(oHeight>height){
        h = height;
        const proc = height/oHeight;
        //setProcent(proc);
        dispatch(setProcent(proc));
        w = oWidth*proc;
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      setTimeout(() => resolve());
    });
  };

  const renderDots = (arrDots: Keypoint[]) => {
    const proc = store.getState().app.procent;
    console.log('from store = ', store.getState().app.procent);
    const canvas = canvasEl.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    arrDots.forEach(dot => {
      ctx.fillRect(dot.x * proc - 3, dot.y * proc - 3, 6, 6);
    });

  }

  const renderPidjack = () => {
    
    const img = new Image();
    setStatus('anilized');
    img.onload = async () => {
      const canvas = canvasEl.current!;
      const ctx = canvas.getContext('2d')!;
      //console.log('img = ', img.width);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      //URL.revokeObjectURL(img.src);
      ctx.fillStyle = 'red';
      pidjak1.forEach(dot => {
        ctx.fillRect(dot.x - 3, dot.y - 3, 6, 6);
      });
      //console.log('poses = ', poses[0].keypoints);
    };

    img.src = './assets/pidjac.png';
    
  };

  return (
    <div className="App">  
      {
        (detector && status === 'no-img') &&
        <>
          <input type='file' accept='image/png, image/jpeg' onChange={onChangeImg} />
        </>
      }
      {
        status !== 'no-img' && <div>{status}</div>
      }
      <canvas ref={canvasEl}></canvas>
    </div>
  );
}

export default App;
