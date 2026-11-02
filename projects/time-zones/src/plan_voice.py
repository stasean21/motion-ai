# Placeholder word timing (before the recording exists): words spread over planned windows by character count.
import json
B = [("Across Canada and America, time usually follows a familiar pattern: travel west, and the clocks move back.", .2, 7.6),
     ("But after November first, twenty twenty-six, parts of this map stopped lining up the way you’d expect.", 8.1, 13.6),
     ("Take Calgary and Destin, Florida. One sits far to the northwest of the other. Yet in winter, both clocks can show ten in the morning.", 14.2, 24.0),
     ("Now compare Vancouver and Seattle. They’re almost directly north and south of each other — but Vancouver is an hour ahead.", 25.2, 33.2),
     ("Imagine a four-hour journey between them. Leave Vancouver at noon, arrive in Seattle at three. Reverse the journey, and noon becomes five. Same travel time. Different local clocks.", 34.2, 46.4),
     ("The explanation? British Columbia, Alberta, Manitoba and the Northwest Territories kept their summer clock settings, while many neighbours moved back an hour.", 47.2, 57.8),
     ("When those neighbours spring forward again, these winter mismatches disappear — unless the rules change again.", 58.2, 65.6),
     ("Geography didn’t move. The clocks did.", 66.0, 68.8)]
WV, BV = [], []
for li, (txt, a, b) in enumerate(B):
    ws = txt.split(); tot = sum(len(w) + 1 for w in ws); acc = 0
    for w in ws: WV.append([li, w, round(a + (b - a) * acc / tot, 3)]); acc += len(w) + 1
    BV.append([a, b])
open('voice_place.js', 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
