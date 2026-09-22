"""Убирает теневую полосу по нижней кромке слоёв коржа: последние ~12 px каждого
столбца смешиваются с цветом крошки чуть выше. Запуск: python3 _build/lift_bottom.py"""
from PIL import Image
import numpy as np, glob, os
D=os.path.join(os.path.dirname(__file__),'..','img','cake')
N=14
for f in sorted(glob.glob(os.path.join(D,'sponge-*.webp'))):
    im=Image.open(f).convert('RGBA'); a=np.asarray(im).astype(np.float32)
    A=a[...,3]; H,W=A.shape
    for x in range(W):
        ys=np.nonzero(A[:,x]>200)[0]
        if ys.size<N+20: continue
        b=ys[-1]
        # референс: медиана цвета в 12 строках над полосой
        ref=np.median(a[b-N-14:b-N-2,x,:3],axis=0)
        for i in range(N):
            y=b-i; t=(1-i/N)**1.3*0.92      # сильнее у самого края
            a[y,x,:3]=a[y,x,:3]*(1-t)+ref*t
    Image.fromarray(np.clip(a,0,255).astype(np.uint8),'RGBA').save(f,quality=84,method=6)
    print(os.path.basename(f),'ok')
