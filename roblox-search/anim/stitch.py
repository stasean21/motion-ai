# склейка кусков музыки: у каждого куска k>0 первые PRE с — запас; стык — кроссфейд 30 мс → out/music.wav
import wave,sys,array
CH,PRE,SR=int(sys.argv[1]) if len(sys.argv)>1 else 60,4,44100
out=array.array('h');k=0
while True:
    try:w=wave.open(f'out/music-{k}.wav')
    except FileNotFoundError:break
    a=array.array('h',w.readframes(w.getnframes()));w.close()
    if k>0:
        a=a[(PRE*SR-int(.03*SR))*2:];n=int(.03*SR)
        for i in range(n):
            p=i/n
            for c in range(2):
                j=len(out)-2*n+2*i+c;out[j]=int(out[j]*(1-p)+a[2*i+c]*p)
        a=a[2*n:]
    out.extend(a);k+=1
w=wave.open('out/music.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(out.tobytes());w.close();print('chunks',k,len(out)/2/SR,'s')
