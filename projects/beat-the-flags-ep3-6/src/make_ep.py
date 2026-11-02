# Build btfN.html for Beat the Flags parts 3–6 from the part-2 page (same layout, motion and sound; new rounds, texts, sprites, voice)
import json, re, sys
EP = {
 3: dict(fl=[('jp', 'JAPAN'), ('de', 'GERMANY'), ('it', 'ITALY'), ('ar', 'ARGENTINA'), ('za', 'SOUTH AFRICA'), ('ma', 'MOROCCO'), ('vn', 'VIETNAM'), ('np', 'NEPAL'), ('mn', None)],
         med='WATCH THE DETAILS', boss='CAN YOU NAME IT?',
         lines=['Nine flags. Start easy. Finish as a geography legend?', 'Medium unlocked. Watch the details.', 'Four down. How many did you get? Follow for more!', 'Final boss. Can you name this country?']),
 4: dict(fl=[('us', 'UNITED STATES'), ('fr', 'FRANCE'), ('no', 'NORWAY'), ('tr', 'TÜRKIYE'), ('mx', 'MEXICO'), ('ge', 'GEORGIA'), ('lb', 'LEBANON'), ('az', 'AZERBAIJAN'), ('jo', None)],
         med='STILL GETTING THEM ALL?', boss='THE ANSWER IS YOURS',
         lines=['You know the famous flags. What about the last two?', 'Medium unlocked. Still getting them all?', 'Halfway check. Your score out of four? Follow for more!', 'Final flag. The answer is yours.']),
 5: dict(fl=[('gb', 'UNITED KINGDOM'), ('au', 'AUSTRALIA'), ('fi', 'FINLAND'), ('cn', 'CHINA'), ('pt', 'PORTUGAL'), ('pk', 'PAKISTAN'), ('uy', 'URUGUAY'), ('hr', 'CROATIA'), ('mk', None)],
         med='KEEP THAT STREAK GOING', boss='NO REVEAL',
         lines=['Five seconds. One flag. How long can you stay perfect?', 'Medium level. Keep that streak going.', 'Four flags done. Still a perfect score? Follow for more!', 'Final boss. No reveal this time.']),
 6: dict(fl=[('es', 'SPAIN'), ('kr', 'SOUTH KOREA'), ('be', 'BELGIUM'), ('il', 'ISRAEL'), ('cl', 'CHILE'), ('id', 'INDONESIA'), ('gh', 'GHANA'), ('eg', 'EGYPT'), ('me', None)],
         med='TAKE A CLOSER LOOK', boss='NO REVEAL',
         lines=['Easy flags first. A mystery flag last. Ready to play?', 'Medium unlocked. Take a closer look.', 'Four down. Keep your score. Follow for the next quiz!', 'One last flag. What’s your guess?'])}
def blocks(n):
    e = EP[n]; nm = [x[1] for x in e['fl']]; spoken = [('Turkey' if x == 'TÜRKIYE' else x.title()) + '!' for x in nm[:8]]
    return [e['lines'][0], 'Five seconds each. Keep your score!', spoken[0], spoken[1], e['lines'][1], spoken[2], spoken[3], e['lines'][2], 'Hard level. Stay focused.',
            spoken[4], spoken[5], spoken[6], 'Expert unlocked. Two flags left. Can you finish strong?', spoken[7], e['lines'][3], 'Know it?',
            'Comment your score and the final country. Follow for the next challenge!']
if __name__ == '__main__':
    n = int(sys.argv[1]); e = EP[n]; fl = e['fl']
    if len(sys.argv) > 2 and sys.argv[2] == 'blocks': json.dump(blocks(n), open(f'../voice/ep{n}_blocks_text.json', 'w'), ensure_ascii=False, indent=1); sys.exit()
    s = open('btf2.html', encoding='utf-8').read()
    def r(a, b, c=1):
        global s
        assert a in s, a[:80]; s = s.replace(a, b) if c == 0 else s.replace(a, b, c)
    r('<title>', f'<title>')
    s = re.sub(r'<title>.*?</title>', f'<title>Beat the Flags · Part {n}</title>', s)
    r('<script src="balls3/meta.js"></script>', '<script src="balls4/meta.js"></script>')
    r('src="voice_place.js"', f'src="voice_ep{n}.js"')
    react = [[['A', .35], ['B', .55]], [['A', .1], ['C', .14], ['D', .12], ['B', .54]], [['A', .35], ['B', .55]], [['A', .45], ['B', .45]],
             [['A', .2], ['C', .45], ['A', .25]], [['A', .35], ['B', .55]], [['A', .35], ['B', .55]], [['A', .3], ['C', .6]]]
    enters = ['rise', 'right', 'flip', 'up', 'flip', 'book', 'right', 'flip', 'slowflip']; S = [7.2, 16.1, 25.5, 34.4, 46.3, 55.2, 64.1, 74.5, 83.9]; LVn = [0, 0, 1, 1, 2, 2, 2, 3, 3]
    rd = ',\n'.join(" {f:'%s',name:%s,S:%s,lv:%d,enter:'%s'%s}" % (c, json.dumps(nm, ensure_ascii=False) if nm else 'null', S[i], LVn[i], enters[i], (',react:' + json.dumps(react[i])) if nm else '') for i, (c, nm) in enumerate(fl))
    s = re.sub(r'const RD=\[\n.*?\];', 'const RD=[\n' + rd + '];', s, flags=re.S)
    r("'MEDIUM UNLOCKED','STILL GETTING THEM ALL?'", f"'MEDIUM UNLOCKED','{e['med']}'"); r("'HARD UNLOCKED','LOOK AT THE DETAILS'", "'HARD UNLOCKED','STAY FOCUSED'")
    r("'FINAL BOSS','NO REVEAL'", f"'FINAL BOSS','{e['boss']}'")
    r("const SRC=k=>BM3[k]?['balls3',BM3[k]]", "const SRC=k=>BM4[k]?['balls4',BM4[k]]"); r("Object.keys(BM3)", "Object.keys(BM4)")
    # ball acting keyed by round number instead of part-2 country codes
    for code, i in (('br', 1), ('se', 2), ('gr', 3), ('ph', 5), ('lk', 6), ('rs', 7), ('kh', 8)): s = s.replace(f"cur.f==='{code}'", f"cur===RD[{i}]")
    # hook plates follow the hook line in three steps
    hw0 = re.search(r"const hw=\[\[wt\(0,'these'\).*?\]\]\.find", s).group(0)
    s = s.replace(hw0, "const h0=BV[0][0],h1=BV[0][1],hq=(h1-h0)/3;const hw=[[h0,h0+hq,'9 FLAGS'],[h0+hq,h0+2*hq,'4 LEVELS'],[h0+2*hq,5.15,`BEAT THE <span style=\"color:${BLUE};margin-left:.28em\">FLAGS</span>&nbsp;· PART " + str(n) + "`]].find")
    s = s.replace("[wt(0,'these'),wt(0,'but'),wt(0,'beat')].forEach(a=>sx(a-.05,'pop',.35))", "[0,1,2].forEach(k=>sx(BV[0][0]+k*(BV[0][1]-BV[0][0])/3-.05,'pop',.35))")
    r("ri?`ROUND ${ri}/9`:'9 FLAGS'", f"ri?`ROUND ${{ri}}/9`:'PART {n}'")
    r("src=\"flags/kh.svg\"", f"src=\"flags/{fl[8][0]}.svg\"")
    keys = [x[1].split()[-1].title() + '!' for x in fl[:8]] + [x[1].split()[0].title() for x in fl[:8] if ' ' in x[1]]
    s = re.sub(r'const KEY=/\^\(.*?\)/i;', 'const KEY=/^(' + '|'.join(re.escape(k) for k in keys + ['Turkey!', 'easy\\.', 'four', 'score!', 'Medium', 'Follow', 'Hard', 'focused\\.', 'Expert', 'strong\\?', 'boss\\.', 'flag\\.?', 'guess\\?', 'legend\\?', 'perfect\\?', 'score', 'it\\?', 'country\\?']).replace('\\\\', '\\') + ')/i;', s)
    s = s.replace('box-shadow:0 0 0 2px rgba(0,0,0,.08)', 'box-shadow:0 0 0 3px rgba(20,30,50,.24)')   # white-field flags (Indonesia, Japan…) keep a visible edge on the white card
    assert 'BM3' not in s and "'kh'" not in s, [m.start() for m in re.finditer('BM3|kh', s)][:5]
    open(f'btf{n}.html', 'w', encoding='utf-8').write(s); print('wrote', f'btf{n}.html')
