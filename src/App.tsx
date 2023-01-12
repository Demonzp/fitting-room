import { useState, useEffect, useRef } from 'react';
import { SupportedModels, createDetector, PoseDetector, Keypoint } from '@tensorflow-models/pose-detection';
import './App.css';

type TStatus = 'anilized' | 'ready' | 'no-img';

function App() {
  const model = SupportedModels.MoveNet;

  const [detector, setDetector] = useState<PoseDetector | null>(null);
  const [status, setStatus] = useState<TStatus>('no-img');
  const canvasEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initDetector();
  }, []);

  const initDetector = async () => {
    const d = await createDetector(model);
    setDetector(d);
    //setStatus('vse cruto!!!!');
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
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      setTimeout(()=>resolve());
    });
  };

  const renderDots = (arrDots: Keypoint[])=>{
    const canvas = canvasEl.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    arrDots.forEach(dot=>{
      ctx.fillRect(dot.x-2, dot.y-2, 4, 4);
    });
    
  }

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
