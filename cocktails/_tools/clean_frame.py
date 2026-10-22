# Убирает золотую рамку и веер с фото, чтобы нарисовать их отдельным неподвижным слоем.
# python3 clean_frame.py <фото> <выход plate.png> [маска.png]
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
img = cv2.imread(src)
h, w = img.shape[:2]
b, g, r = [img[..., i].astype(int) for i in range(3)]
gold = ((r > 90) & (g > 55) & (r - b > 40) & (g > b)).astype(np.uint8)

# где может быть рамка: полосы вдоль краёв и веер сверху по центру
zone = np.zeros((h, w), np.uint8)
zone[:, 10:62] = 1
zone[:, w - 62:w - 10] = 1
zone[28:90, :] = 1
zone[h - 90:h - 30, :] = 1
zone[0:92, 380:560] = 1

mask = cv2.dilate(gold * zone, np.ones((5, 5), np.uint8))
# сами линии рамки чистим полностью, даже там, где они темнее золота
for x in (22, w - 23):
    mask[30:h - 30, x - 4:x + 5] = 1
for y in (40, h - 41):
    mask[y - 4:y + 5, 15:w - 15] = 1

out = cv2.inpaint(img, mask * 255, 9, cv2.INPAINT_TELEA)
cv2.imwrite(dst, out)
if len(sys.argv) > 3:
    cv2.imwrite(sys.argv[3], mask * 255)
