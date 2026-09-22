"""Убирает тёмную кайму на краях слоёв торта: при экспорте полупрозрачные
пиксели были смешаны с чёрным фоном. Восстанавливает цвет делением на альфу
и слегка растворяет нижнюю кромку коржей. Запуск: python3 _build/unpremultiply.py"""
from PIL import Image, ImageFilter
import numpy as np, glob, os
D=os.path.join(os.path.dirname(__file__),'..','img','cake')
for f in sorted(glob.glob(os.path.join(D,'*.webp'))):
    im=Image.open(f).convert('RGBA'); a=np.asarray(im).astype(np.float32)
    rgb,al=a[...,:3],a[...,3:4]
    k=np.where(al>0,255.0/np.maximum(al,1),0)
    k=np.minimum(k,255.0/24)           # не раздувать шум у почти прозрачных пикселей
    rgb=np.clip(rgb*k,0,255)
    # у почти прозрачных краёв берём цвет ближайшего непрозрачного соседа (без чёрного)
    name=os.path.basename(f)
    out=np.concatenate([rgb,al],axis=2).astype(np.uint8)
    res=Image.fromarray(out,'RGBA')
    if name.startswith('sponge-'):
        # мягкая нижняя кромка: альфа коржа растворяется на последних 5 px
        A=np.asarray(res.split()[3]).astype(np.float32)
        H,W=A.shape
        # для каждого столбца найти нижний непрозрачный пиксель
        cols=np.where(A>128)
        bottom=np.full(W,-1)
        for x in range(W):
            ys=np.nonzero(A[:,x]>128)[0]
            if ys.size: bottom[x]=ys[-1]
        for x in range(W):
            b=bottom[x]
            if b<0: continue
            for i in range(6):
                y=b-i
                if y<0: break
                A[y,x]*= (i+1)/7.0 if i<6 else 1
        res.putalpha(Image.fromarray(A.astype(np.uint8),'L').filter(ImageFilter.GaussianBlur(.6)))
    res.save(f,quality=84,method=6)
    print(name,os.path.getsize(f)//1024,'KB')
