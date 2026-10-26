"""Cut character sheets into separate transparent sprites (left->right, top->bottom)."""
import os

import cv2
import numpy as np

L = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "layers")
SHEETS = {
    "07_guests__sheet_happy": ("07_guests__happy", ["brazil", "usa", "uk", "japan", "egypt", "romania"], "row"),
    "07_guests__sheet_scared": ("07_guests__scared", ["brazil", "usa", "uk", "japan", "egypt", "romania"], "row"),
    "09_final__sheet_flee": ("09_final__flee", ["brazil", "usa", "uk", "japan", "egypt", "romania"], "grid"),
    "06_romania__bats": ("06_romania__bat", ["1", "2", "3"], "col"),
}


def split_row(img, prefix, labels):
    """Characters touching in a row: cut at the emptiest columns near equal divisions."""
    a = img[..., 3].astype(np.float32)
    ys, xs = np.where(a > 20)
    x0, x1 = xs.min(), xs.max()
    prof = a.sum(0)
    n = len(labels)
    cuts = [x0]
    for i in range(1, n):
        c = x0 + (x1 - x0) * i / n
        lo, hi = int(c - (x1 - x0) / n * 0.3), int(c + (x1 - x0) / n * 0.3)
        cuts.append(lo + int(np.argmin(prof[lo:hi])))
    cuts.append(x1 + 1)
    for lbl, (c0, c1) in zip(labels, zip(cuts[:-1], cuts[1:])):
        col = a[:, c0:c1]
        yy = np.where(col.max(1) > 20)[0]
        crop = img[max(yy.min() - 6, 0):yy.max() + 6, c0:c1].copy()
        crop = cv2.copyMakeBorder(crop, 0, 0, 6, 6, cv2.BORDER_CONSTANT, value=0)
        cv2.imwrite(os.path.join(L, f"{prefix}_{lbl}.png"), crop)
        print(prefix, lbl, crop.shape[1], "x", crop.shape[0])


def split(name, prefix, labels, order):
    img = cv2.imread(os.path.join(L, name + ".png"), cv2.IMREAD_UNCHANGED)
    if order == "row":
        return split_row(img, prefix, labels)
    a = (img[..., 3] > 20).astype(np.uint8)
    k = max(3, img.shape[1] // 120)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(cv2.dilate(a, np.ones((k, k), np.uint8)))
    comps = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])[:len(labels)]
    if order == "row":
        comps.sort(key=lambda i: cent[i][0])
    elif order == "col":
        comps.sort(key=lambda i: cent[i][1])
    else:
        comps.sort(key=lambda i: cent[i][1])                       # 2-column grid: pair rows, then x
        comps = [c for k in range(0, len(comps), 2) for c in sorted(comps[k:k + 2], key=lambda i: cent[i][0])]
    for lbl, i in zip(labels, comps):
        x, y, w, h = stats[i, :4]
        pad = 6
        x0, y0 = max(x - pad, 0), max(y - pad, 0)
        crop = img[y0:y + h + pad, x0:x + w + pad].copy()
        crop[..., 3] = crop[..., 3] * (lab[y0:y + h + pad, x0:x + w + pad] == i)
        cv2.imwrite(os.path.join(L, f"{prefix}_{lbl}.png"), crop)
        print(prefix, lbl, crop.shape[1], "x", crop.shape[0])


if __name__ == "__main__":
    for name, (prefix, labels, order) in SHEETS.items():
        split(name, prefix, labels, order)
