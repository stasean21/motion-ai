"""Tomato vs 1000 cuts — single-frame scene builder for Blender (bpy).

Usage: python scene.py <out.png> <cut> <pile> [knife] [width] [samples]
  cut   0..1  fraction of the tomato already turned into cubes (0 = whole)
  pile  0..1  size of the cube pile (1 = whole tomato)
  knife none | raised | blur
"""
import sys, math, random
import bpy, bmesh
from mathutils import Vector, Matrix

out = sys.argv[1]
CUT = float(sys.argv[2])
PILE = float(sys.argv[3])
KNIFE = sys.argv[4] if len(sys.argv) > 4 else "blur"
W = int(sys.argv[5]) if len(sys.argv) > 5 else 1080
SAMPLES = int(sys.argv[6]) if len(sys.argv) > 6 else 64
SEAMS = float(sys.argv[7]) if len(sys.argv) > 7 else 0.0
KC = float(sys.argv[8]) if len(sys.argv) > 8 else None  # knife plane override
HERE = __file__.rsplit("/", 1)[0]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
random.seed(7)

# board long axis; the knife walks along it, pile falls toward -AX
YAW = math.radians(28)
AX = Vector((math.cos(YAW), math.sin(YAW), 0))
SIDE = Vector((-AX.y, AX.x, 0))
BOARD_TOP = 0.0
R = 1.0          # tomato radius
SQ = 0.86        # vertical squash
T0 = Vector((0.35, 0.25, BOARD_TOP + R * SQ))  # tomato centre


def mat(name, base, rough=0.5, spec=0.5, sss=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Specular IOR Level"].default_value = spec
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (0.6, 0.15, 0.1)
        b.inputs["Subsurface Scale"].default_value = 0.08
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.08
    return m


def link(obj):
    sc.collection.objects.link(obj)
    return obj


def mesh_obj(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


# ---------------------------------------------------------------- world / env
world = bpy.data.worlds.new("w")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.035, 0.04, 0.04, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0

# dark counter
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=40)
counter = mesh_obj("counter", bm)
counter.location.z = -0.55
counter.data.materials.append(mat("counter", (0.045, 0.045, 0.045), rough=0.6))

# brick wall behind
bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=30)
wall = mesh_obj("wall", bm)
wall.rotation_euler = (math.radians(90), 0, YAW)
wall.location = T0 + SIDE * 5.5
wall.location.z = 6
wm = bpy.data.materials.new("brick")
wm.use_nodes = True
nt = wm.node_tree
bsdf = nt.nodes["Principled BSDF"]
br = nt.nodes.new("ShaderNodeTexBrick")
br.inputs["Color1"].default_value = (0.09, 0.11, 0.095, 1)
br.inputs["Color2"].default_value = (0.07, 0.085, 0.075, 1)
br.inputs["Mortar"].default_value = (0.018, 0.02, 0.02, 1)
br.inputs["Scale"].default_value = 1.6
br.inputs["Mortar Size"].default_value = 0.012
tc = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
nt.links.new(br.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 0.85
wall.data.materials.append(wm)

# ---------------------------------------------------------------- board
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1)
bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.03, segments=3, affect="EDGES")
board = mesh_obj("board", bm)
board.scale = (18, 4.2, 0.55)
board.rotation_euler.z = YAW
board.location = Vector((0, 0, BOARD_TOP - 0.275)) + SIDE * 0.6
bmat = bpy.data.materials.new("wood")
bmat.use_nodes = True
nt = bmat.node_tree
bsdf = nt.nodes["Principled BSDF"]
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (0.08, 1.4, 1.0)
wave = nt.nodes.new("ShaderNodeTexWave")
wave.wave_type = "BANDS"
wave.bands_direction = "Y"
wave.inputs["Scale"].default_value = 3.0
wave.inputs["Distortion"].default_value = 7.0
wave.inputs["Detail"].default_value = 4.0
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.62, 0.40, 0.19, 1)
ramp.color_ramp.elements[1].color = (0.78, 0.54, 0.28, 1)
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
nt.links.new(mp.outputs["Vector"], wave.inputs["Vector"])
nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 0.55
board.data.materials.append(bmat)

# ---------------------------------------------------------------- tomato
tom_skin = mat("tomato_skin", (0.62, 0.035, 0.02), rough=0.18, spec=0.6, sss=0.25, coat=0.6)
if SEAMS > 0:
    # thin knife seams along the board axis, like the reference onion
    nt = tom_skin.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeVectorMath")
    sep.operation = "DOT_PRODUCT"
    sep.inputs[1].default_value = AX
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_profile = "SAW"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 7.0
    sn = nt.nodes.new("ShaderNodeMath")
    sn.operation = "FRACT"
    lt = nt.nodes.new("ShaderNodeMath")
    lt.operation = "LESS_THAN"
    lt.inputs[1].default_value = 0.025 * SEAMS
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = (0.62, 0.035, 0.02, 1)
    mix.inputs["B"].default_value = (0.38, 0.02, 0.012, 1)
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    nt.links.new(sep.outputs["Value"], mul.inputs[0])
    nt.links.new(mul.outputs[0], sn.inputs[0])
    nt.links.new(sn.outputs[0], lt.inputs[0])
    nt.links.new(lt.outputs[0], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])

cap_mat = bpy.data.materials.new("cap")
cap_mat.use_nodes = True
nt = cap_mat.node_tree
bsdf = nt.nodes["Principled BSDF"]
img = nt.nodes.new("ShaderNodeTexImage")
img.image = bpy.data.images.load(f"{HERE}/cap.png")
nt.links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 0.12
bsdf.inputs["Subsurface Weight"].default_value = 0.3
bsdf.inputs["Subsurface Radius"].default_value = (0.8, 0.2, 0.1)
bsdf.inputs["Subsurface Scale"].default_value = 0.05
bsdf.inputs["Coat Weight"].default_value = 0.5

bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=48, radius=R)
for v in bm.verts:
    x, y, z = v.co
    phi = math.atan2(y, x)
    rxy = math.hypot(x, y)
    lobe = 1 - 0.02 * (1 - math.cos(5 * phi)) * rxy * max(0.0, z + 0.3)
    top = 1 - 0.12 * math.exp(-(rxy / 0.25) ** 2) * max(0.0, z)  # dimple around stem
    v.co = Vector((x * lobe, y * lobe, z * SQ * top))
# knife has eaten the -AX side up to plane dot(p, AX) = c
c = -R + 2 * R * CUT
if CUT >= 0.999:
    bm.clear()
elif CUT > 0:
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=AX * c, plane_no=AX, clear_inner=True)
    cut_edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    fill = bmesh.ops.edgeloop_fill(bm, edges=cut_edges)
    uv = bm.loops.layers.uv.verify()
    rr = math.sqrt(max(1e-4, R * R - c * c))
    for f in fill["faces"]:
        f.material_index = 1
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = (0.5 + co.dot(SIDE) / (2 * rr), 0.5 + co.z / (2 * rr * SQ))
tomato = mesh_obj("tomato", bm)
tomato.location = T0
tomato.data.materials.append(tom_skin)
tomato.data.materials.append(cap_mat)
for p in tomato.data.polygons:
    p.use_smooth = p.material_index == 0

# calyx + stem, only while the top still exists
if c < -0.4:
    green = mat("calyx", (0.09, 0.25, 0.04), rough=0.55)
    top_z = T0.z + R * SQ * 0.8
    for i in range(6):
        a = i * math.tau / 6 + 0.3
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.09, radius2=0.0, depth=0.55)
        sep = mesh_obj(f"sepal{i}", bm)
        sep.data.materials.append(green)
        sep.rotation_euler = (0, math.radians(100), a)
        sep.location = Vector((T0.x + math.cos(a) * 0.2, T0.y + math.sin(a) * 0.2, top_z + 0.03))
        sep.scale = (1, 0.35, 1)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.06, radius2=0.045, depth=0.28)
    stem = mesh_obj("stem", bm)
    stem.data.materials.append(green)
    stem.location = (T0.x, T0.y, top_z + 0.14)
    stem.rotation_euler = (0.25, 0.1, 0)

# ---------------------------------------------------------------- cube pile
if PILE > 0:
    # mound grows toward a tall rounded cone; centre drifts onto the tomato spot
    pr = 1.45 * PILE ** (1 / 3)
    ph = 1.75 * PILE ** (1 / 3)
    centre = T0 - AX * (1.55 * (1 - PILE) + 0.0)
    centre.z = BOARD_TOP
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=1)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.001], context="VERTS")
    for v in bm.verts:
        z = max(0.0, v.co.z)
        rxy = math.hypot(v.co.x, v.co.y)
        # rounded cone profile
        h = math.cos(min(rxy, 1.0) * math.pi / 2) ** 1.25
        v.co = Vector((v.co.x * pr, v.co.y * pr, (z if rxy < 1e-6 else h) * ph))
    pile = mesh_obj("pile", bm)
    pile.location = centre
    for p in pile.data.polygons:
        p.use_smooth = True
    mod = pile.modifiers.new("sub", "SUBSURF")
    mod.levels = mod.render_levels = 2
    tex = bpy.data.textures.new("lumpy", "CLOUDS")
    tex.noise_scale = 0.08
    d = pile.modifiers.new("disp", "DISPLACE")
    d.texture = tex
    d.strength = 0.012
    pile.data.materials.append(mat("pile_base", (0.3, 0.015, 0.01), rough=0.3, sss=0.2))

    # tiny glossy cubes scattered over the mound, built as one mesh
    import numpy as np
    rng = np.random.default_rng(3)
    n = int(16000 + 60000 * PILE)
    rxy = np.sqrt(rng.random(n)) * 0.995
    ang = rng.random(n) * math.tau
    hz = np.cos(rxy * math.pi / 2) ** 1.25
    pts = np.stack([np.cos(ang) * rxy * pr, np.sin(ang) * rxy * pr, hz * ph], 1)
    pts += rng.normal(0, 0.008, pts.shape)
    size = 0.034 * (0.65 + 0.7 * rng.random(n))
    corners = np.array([[x, y, z] for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)])
    # random rotation per cube (via random orthonormal basis)
    q = rng.normal(size=(n, 4)); q /= np.linalg.norm(q, axis=1, keepdims=True)
    w, x, y, z = q.T
    rot = np.stack([
        np.stack([1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], 1),
        np.stack([2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], 1),
        np.stack([2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)], 1)], 1)
    verts = np.einsum("nij,kj->nki", rot, corners) * size[:, None, None] + pts[:, None, :]
    faces_local = np.array([[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]])
    faces = (faces_local[None] + 8 * np.arange(n)[:, None, None]).reshape(-1, 4)
    me = bpy.data.meshes.new("dice")
    me.vertices.add(n * 8)
    me.vertices.foreach_set("co", verts.reshape(-1).astype(np.float32))
    me.loops.add(len(faces) * 4)
    me.loops.foreach_set("vertex_index", faces.reshape(-1).astype(np.int32))
    me.polygons.add(len(faces))
    me.polygons.foreach_set("loop_start", (np.arange(len(faces)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(faces), 4, np.int32))
    palette = np.array([[0.30, 0.012, 0.008], [0.55, 0.03, 0.015], [0.45, 0.02, 0.012],
                        [0.70, 0.10, 0.03], [0.75, 0.35, 0.08]])
    pick = rng.choice(len(palette), n, p=[0.2, 0.4, 0.27, 0.1, 0.03])
    col = np.concatenate([palette[pick], np.ones((n, 1))], 1)
    col = np.repeat(col, 24, axis=0)
    attr = me.color_attributes.new("col", "FLOAT_COLOR", "CORNER")
    attr.data.foreach_set("color", col.reshape(-1).astype(np.float32))
    me.update()
    me.validate()
    dice = link(bpy.data.objects.new("dice", me))
    dice.location = centre
    cm = bpy.data.materials.new("dice")
    cm.use_nodes = True
    nt = cm.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    ca = nt.nodes.new("ShaderNodeVertexColor")
    ca.layer_name = "col"
    nt.links.new(ca.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.15
    bsdf.inputs["Coat Weight"].default_value = 0.7
    bsdf.inputs["Coat Roughness"].default_value = 0.05
    bsdf.inputs["Subsurface Weight"].default_value = 0.15
    bsdf.inputs["Subsurface Radius"].default_value = (0.8, 0.2, 0.1)
    bsdf.inputs["Subsurface Scale"].default_value = 0.02
    dice.data.materials.append(cm)

# ---------------------------------------------------------------- knife
steel = mat("steel", (0.62, 0.64, 0.67), rough=0.22, spec=0.8)
steel.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.35
handle = mat("handle", (0.08, 0.05, 0.03), rough=0.4)


def blade_obj(name, material):
    bm = bmesh.new()
    pts = [(0, 0), (2.6, 0.0), (3.0, 0.22), (2.6, 0.5), (0, 0.55)]
    vs = [bm.verts.new((x, 0, y)) for x, y in pts]
    f = bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=[f], thickness=0.03)
    o = mesh_obj(name, bm)
    o.data.materials.append(material)
    return o


def ghost_mat(alpha):
    m = bpy.data.materials.new(f"ghost{alpha:.2f}")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.8, 0.82, 0.85, 1)
    bsdf.inputs["Metallic"].default_value = 0.3
    bsdf.inputs["Roughness"].default_value = 0.2
    bsdf.inputs["Alpha"].default_value = alpha
    return m


def knife_pose(o, t):
    """t in 0..1 along a downward swipe through the cut plane."""
    plane = T0 + AX * (KC if KC is not None else c + 0.02)
    a = math.radians(-40 + 45 * t)
    o.rotation_euler = (0, a, YAW + math.radians(90))
    o.location = plane - SIDE * (1.9 - 0.6 * t) + Vector((0, 0, 2.5 - 1.5 * t))


if KNIFE == "raised":
    k = blade_obj("knife", steel)
    k.rotation_euler = (0, math.radians(-22), YAW + math.radians(90))
    k.location = T0 + AX * (KC or 0.0) - SIDE * 1.9 + Vector((0, 0, 1.15))
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    h = mesh_obj("handle", bm)
    h.data.materials.append(handle)
    h.parent = k
    h.scale = (1.4, 0.06, 0.32)
    h.location = (-0.7, 0, 0.3)
elif KNIFE == "blur":
    for i in range(12):
        t = i / 11
        k = blade_obj(f"ghost{i}", ghost_mat(0.025 + 0.05 * t))
        knife_pose(k, 0.2 + 0.75 * t)

# ---------------------------------------------------------------- lights + camera
sun = bpy.data.lights.new("sun", "SUN")
sun.energy = 3.4
sun.angle = math.radians(3)
sun.color = (1.0, 0.95, 0.86)
so = link(bpy.data.objects.new("sun", sun))
so.rotation_euler = (math.radians(40), math.radians(-28), math.radians(-30))
fill = bpy.data.lights.new("fill", "AREA")
fill.energy = 450
fill.size = 8
fo = link(bpy.data.objects.new("fill", fill))
fo.location = T0 + Vector((-4, -7, 6))
fo.rotation_euler = (math.radians(50), 0, math.radians(-30))

cam = bpy.data.cameras.new("cam")
cam.lens = 50
co = link(bpy.data.objects.new("cam", cam))
co.location = T0 + Vector((-3.0, -7.6, 5.4))
target = T0 + Vector((0.2, 0.6, 0.1))
co.rotation_euler = (target - co.location).to_track_quat("-Z", "Y").to_euler()
sc.camera = co

sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.resolution_x = W
sc.render.resolution_y = int(W * 16 / 9)
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
