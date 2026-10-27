"""Tomato vs cuts — 5-level video renderer for Blender (bpy).

Usage: python video.py <out_dir> <level 1..5|all> [width] [samples] [fps3d]
Renders 3D frames <out_dir>/L<level>_<frame>.png at fps3d (identical states
are rendered once and reused). Counters and audio are added by compose.py.
"""
import sys, os, math, json, shutil
import numpy as np
import bpy, bmesh
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timeline import LEVELS, state_at, level_frames

HERE = os.path.dirname(os.path.abspath(__file__))

# board long axis; the knife walks along it, the pile falls toward -AX
YAW = math.radians(28)
AX = Vector((math.cos(YAW), math.sin(YAW), 0))
SIDE = Vector((-AX.y, AX.x, 0))
BOARD_TOP = 0.0
R = 1.0          # tomato radius
SQ = 0.86        # vertical squash
T0 = Vector((0.35, 0.25, BOARD_TOP + R * SQ))  # tomato centre
N_SLICES = 11

sc = None
dyn = None
M = {}


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


def mesh_obj(name, bm, coll=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    (coll or dyn).objects.link(o)
    return o


# ---------------------------------------------------------------- static scene
def build_static(width, samples):
    global sc, dyn
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    static = sc.collection
    dyn = bpy.data.collections.new("dyn")
    sc.collection.children.link(dyn)

    world = bpy.data.worlds.new("w")
    sc.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.035, 0.04, 0.04, 1)

    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=40)
    counter = mesh_obj("counter", bm, static)
    counter.location.z = -0.55
    counter.data.materials.append(mat("counter", (0.045, 0.045, 0.045), rough=0.6))

    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=30)
    wall = mesh_obj("wall", bm, static)
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

    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.03, segments=3, affect="EDGES")
    board = mesh_obj("board", bm, static)
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

    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy = 3.4
    sun.angle = math.radians(3)
    sun.color = (1.0, 0.95, 0.86)
    so = bpy.data.objects.new("sun", sun)
    static.objects.link(so)
    so.rotation_euler = (math.radians(40), math.radians(-28), math.radians(-30))
    fill = bpy.data.lights.new("fill", "AREA")
    fill.energy = 450
    fill.size = 8
    fo = bpy.data.objects.new("fill", fill)
    static.objects.link(fo)
    fo.location = T0 + Vector((-4, -7, 6))
    fo.rotation_euler = (math.radians(50), 0, math.radians(-30))

    cam = bpy.data.cameras.new("cam")
    cam.lens = 50
    co = bpy.data.objects.new("cam", cam)
    static.objects.link(co)
    co.location = T0 + Vector((-3.0, -7.6, 5.4))
    target = T0 + Vector((0.2, 0.6, 0.1))
    co.rotation_euler = (target - co.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = co

    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    sc.cycles.denoising_prefilter = "FAST"
    sc.cycles.denoising_quality = "FAST"
    sc.cycles.max_bounces = 6
    sc.cycles.seed = 1
    sc.render.resolution_x = width
    sc.render.resolution_y = int(width * 16 / 9)
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"

    build_materials()


def build_materials():
    skin = mat("tomato_skin", (0.62, 0.035, 0.02), rough=0.18, spec=0.6, sss=0.25, coat=0.6)
    # thin knife seams along the board axis; threshold node drives their width
    nt = skin.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = AX
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 7.0
    fr = nt.nodes.new("ShaderNodeMath")
    fr.operation = "FRACT"
    lt = nt.nodes.new("ShaderNodeMath")
    lt.operation = "LESS_THAN"
    lt.inputs[1].default_value = 0.0
    lt.name = "seams"
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = (0.62, 0.035, 0.02, 1)
    mix.inputs["B"].default_value = (0.38, 0.02, 0.012, 1)
    nt.links.new(tc.outputs["Object"], dot.inputs[0])
    nt.links.new(dot.outputs["Value"], mul.inputs[0])
    nt.links.new(mul.outputs[0], fr.inputs[0])
    nt.links.new(fr.outputs[0], lt.inputs[0])
    nt.links.new(lt.outputs[0], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
    M["skin"] = skin

    cap = bpy.data.materials.new("cap")
    cap.use_nodes = True
    nt = cap.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(f"{HERE}/cap.png")
    nt.links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.12
    bsdf.inputs["Subsurface Weight"].default_value = 0.3
    bsdf.inputs["Subsurface Radius"].default_value = (0.8, 0.2, 0.1)
    bsdf.inputs["Subsurface Scale"].default_value = 0.05
    bsdf.inputs["Coat Weight"].default_value = 0.5
    M["cap"] = cap

    M["green"] = mat("calyx", (0.09, 0.25, 0.04), rough=0.55)
    M["pile"] = mat("pile_base", (0.3, 0.015, 0.01), rough=0.3, sss=0.2)

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
    M["dice"] = cm

    steel = mat("steel", (0.62, 0.64, 0.67), rough=0.22, spec=0.8)
    steel.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.35
    M["steel"] = steel
    M["handle"] = mat("handle", (0.08, 0.05, 0.03), rough=0.4)
    M["ghost"] = []
    for i in range(12):
        g = bpy.data.materials.new(f"ghost{i}")
        g.use_nodes = True
        b = g.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = (0.8, 0.82, 0.85, 1)
        b.inputs["Metallic"].default_value = 0.3
        b.inputs["Roughness"].default_value = 0.2
        b.inputs["Alpha"].default_value = 0.025 + 0.05 * i / 11
        M["ghost"].append(g)


def clear_dynamic():
    for o in list(dyn.objects):
        me = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if me is not None and me.users == 0:
            bpy.data.meshes.remove(me)


# ---------------------------------------------------------------- tomato pieces
def tomato_bm():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=48, radius=R)
    for v in bm.verts:
        x, y, z = v.co
        phi = math.atan2(y, x)
        rxy = math.hypot(x, y)
        lobe = 1 - 0.02 * (1 - math.cos(5 * phi)) * rxy * max(0.0, z + 0.3)
        top = 1 - 0.12 * math.exp(-(rxy / 0.25) ** 2) * max(0.0, z)  # dimple around stem
        v.co = Vector((x * lobe, y * lobe, z * SQ * top))
    return bm


def cut_side(bm, c, keep_pos):
    """Bisect at dot(p, AX) = c, keep the + side (or the - side), cap the hole."""
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=AX * c, plane_no=AX,
                                 clear_inner=keep_pos, clear_outer=not keep_pos)
    cut_edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    if not cut_edges:
        return
    fill = bmesh.ops.edgeloop_fill(bm, edges=cut_edges)
    uv = bm.loops.layers.uv.verify()
    rr = math.sqrt(max(1e-4, R * R - c * c))
    for f in fill["faces"]:
        f.material_index = 1
        for lp in f.loops:
            co = lp.vert.co
            lp[uv].uv = (0.5 + co.dot(SIDE) / (2 * rr), 0.5 + co.z / (2 * rr * SQ))


def tomato_piece(name, lo, hi):
    """Part of the tomato between planes lo < dot(p, AX) < hi (None = open)."""
    bm = tomato_bm()
    if lo is not None:
        cut_side(bm, lo, True)
    if hi is not None:
        cut_side(bm, hi, False)
    o = mesh_obj(name, bm)
    o.location = T0
    o.data.materials.append(M["skin"])
    o.data.materials.append(M["cap"])
    for p in o.data.polygons:
        p.use_smooth = p.material_index == 0
    return o


def calyx(parent=None):
    top_z = R * SQ * 0.8
    parts = []
    for i in range(6):
        a = i * math.tau / 6 + 0.3
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.09, radius2=0.0, depth=0.55)
        sep = mesh_obj(f"sepal{i}", bm)
        sep.data.materials.append(M["green"])
        sep.rotation_euler = (0, math.radians(100), a)
        sep.location = Vector((math.cos(a) * 0.2, math.sin(a) * 0.2, top_z + 0.03))
        sep.scale = (1, 0.35, 1)
        parts.append(sep)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.06, radius2=0.045, depth=0.28)
    stem = mesh_obj("stem", bm)
    stem.data.materials.append(M["green"])
    stem.location = (0, 0, top_z + 0.14)
    stem.rotation_euler = (0.25, 0.1, 0)
    parts.append(stem)
    for p in parts:
        if parent is not None:
            p.parent = parent
        else:
            p.location = Vector(p.location) + T0


def slab_bounds(k):
    t = 2 * R / N_SLICES
    lo = -R + k * t
    return (None if k == 0 else lo), (None if k == N_SLICES - 1 else lo + t)


def place_fallen(o, k, f):
    """Tip slab k toward -AX (cut face up) by fraction f, fanned like cards."""
    if f <= 0:
        return
    t = 2 * R / N_SLICES
    theta = math.radians(52) * f
    s = t / math.cos(math.radians(52))
    lo = -R + k * t
    pivot = T0 + AX * lo
    pivot.z = BOARD_TOP
    rot = Matrix.Rotation(theta, 4, SIDE)
    if (rot @ Vector((0, 0, 1))).dot(AX) > 0:
        rot = Matrix.Rotation(-theta, 4, SIDE)
    shift = AX * ((N_SLICES - 1 - k) * (t - s) * f)
    mw = Matrix.Translation(pivot + shift) @ rot @ Matrix.Translation(-pivot) @ Matrix.Translation(T0)
    zmin = min((mw @ v.co).z for v in o.data.vertices)
    o.matrix_world = Matrix.Translation((0, 0, BOARD_TOP - zmin)) @ mw


# ---------------------------------------------------------------- cube pile
_DICE_CACHE = {}


def dice_set(size, nmax):
    key = (size, nmax)
    if key not in _DICE_CACHE:
        rng = np.random.default_rng(3)
        rxy = np.sqrt(rng.random(nmax)) * 0.995
        ang = rng.random(nmax) * math.tau
        jit = rng.normal(0, 1, (nmax, 3))
        sz = size * (0.65 + 0.7 * rng.random(nmax))
        q = rng.normal(size=(nmax, 4))
        q /= np.linalg.norm(q, axis=1, keepdims=True)
        palette = np.array([[0.30, 0.012, 0.008], [0.55, 0.03, 0.015], [0.45, 0.02, 0.012],
                            [0.70, 0.10, 0.03], [0.75, 0.35, 0.08]])
        pick = rng.choice(len(palette), nmax, p=[0.2, 0.4, 0.27, 0.1, 0.03])
        _DICE_CACHE[key] = (rxy, ang, jit, sz, q, palette[pick])
    return _DICE_CACHE[key]


CORNERS = np.array([[x, y, z] for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)])
FACES = np.array([[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]])


def quat_rot(q):
    w, x, y, z = q.T
    return np.stack([
        np.stack([1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], 1),
        np.stack([2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], 1),
        np.stack([2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)], 1)], 1)


def cubes_mesh(name, pts, sz, q, col):
    n = len(pts)
    verts = np.einsum("nij,kj->nki", quat_rot(q), CORNERS) * sz[:, None, None] + pts[:, None, :]
    faces = (FACES[None] + 8 * np.arange(n)[:, None, None]).reshape(-1, 4)
    me = bpy.data.meshes.new(name)
    me.vertices.add(n * 8)
    me.vertices.foreach_set("co", verts.reshape(-1).astype(np.float32))
    me.loops.add(len(faces) * 4)
    me.loops.foreach_set("vertex_index", faces.reshape(-1).astype(np.int32))
    me.polygons.add(len(faces))
    me.polygons.foreach_set("loop_start", (np.arange(len(faces)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(faces), 4, np.int32))
    c4 = np.repeat(np.concatenate([col, np.ones((n, 1))], 1), 24, axis=0)
    attr = me.color_attributes.new("col", "FLOAT_COLOR", "CORNER")
    attr.data.foreach_set("color", c4.reshape(-1).astype(np.float32))
    me.update()
    o = bpy.data.objects.new(name, me)
    dyn.objects.link(o)
    o.data.materials.append(M["dice"])
    return o


def pile(amount, size):
    pr = 1.45 * amount ** (1 / 3)
    ph = 1.75 * amount ** (1 / 3)
    centre = T0 - AX * (1.55 * (1 - amount))
    centre.z = BOARD_TOP
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=1)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.001], context="VERTS")
    for v in bm.verts:
        z = max(0.0, v.co.z)
        rxy = math.hypot(v.co.x, v.co.y)
        h = math.cos(min(rxy, 1.0) * math.pi / 2) ** 1.25
        v.co = Vector((v.co.x * pr, v.co.y * pr, (z if rxy < 1e-6 else h) * ph * 0.97))
    base = mesh_obj("pile", bm)
    base.location = centre
    for p in base.data.polygons:
        p.use_smooth = True
    base.data.materials.append(M["pile"])

    # cover the mound; the same cubes keep their slots as it grows
    full_area = math.pi * 1.45 * math.hypot(1.45, 1.75)
    nmax = int(min(60000, 3.2 * full_area / size ** 2))
    rxy, ang, jit, sz, q, col = dice_set(size, nmax)
    n = max(30, int(nmax * amount ** (2 / 3)))
    hz = np.cos(rxy[:n] * math.pi / 2) ** 1.25
    pts = np.stack([np.cos(ang[:n]) * rxy[:n] * pr, np.sin(ang[:n]) * rxy[:n] * pr, hz * ph], 1)
    pts += jit[:n] * size * 0.25
    o = cubes_mesh("dice", pts, sz[:n], q[:n], col[:n])
    o.location = centre


def falling(c, amount, size, seed):
    """Cubes in the air between the cut face and the pile."""
    rng = np.random.default_rng(seed)
    n = 160 if size < 0.08 else 40
    u = rng.random(n)
    start = T0 + AX * c
    pr = 1.45 * max(amount, 0.05) ** (1 / 3)
    end = T0 - AX * (1.55 * (1 - amount)) + AX * (pr * 0.4)
    pts = []
    for i in range(n):
        p = start.lerp(end, u[i] * 0.7)
        p.z = BOARD_TOP + 0.15 + (1 - u[i]) * (T0.z + 0.6) * rng.random()
        p += SIDE * float(rng.normal(0, 0.45))
        pts.append(tuple(p))
    sz = size * (0.65 + 0.7 * rng.random(n))
    q = rng.normal(size=(n, 4))
    q /= np.linalg.norm(q, axis=1, keepdims=True)
    _, _, _, _, _, colours = dice_set(size, max(n, 200))
    cubes_mesh("falling", np.array(pts), sz, q, colours[:n])


# ---------------------------------------------------------------- knife
def blade(name, material):
    bm = bmesh.new()
    pts = [(0, 0), (2.6, 0.0), (3.0, 0.22), (2.6, 0.5), (0, 0.55)]
    vs = [bm.verts.new((x, 0, y)) for x, y in pts]
    f = bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=[f], thickness=0.03)
    o = mesh_obj(name, bm)
    o.data.materials.append(material)
    return o


def solid_knife(plane, height, tilt):
    k = blade("knife", M["steel"])
    k.rotation_euler = (0, math.radians(tilt), YAW + math.radians(90))
    k.location = T0 + AX * plane - SIDE * 1.9 + Vector((0, 0, height))
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    h = mesh_obj("handle", bm)
    h.data.materials.append(M["handle"])
    h.parent = k
    h.scale = (1.4, 0.06, 0.32)
    h.location = (-0.7, 0, 0.3)


def ghost_knife(plane, phase):
    for i in range(12):
        t = (0.2 + 0.75 * i / 11 + phase) % 1.0
        g = blade(f"ghost{i}", M["ghost"][i])
        a = math.radians(-40 + 45 * t)
        g.rotation_euler = (0, a, YAW + math.radians(90))
        g.location = T0 + AX * plane - SIDE * (1.9 - 0.6 * t) + Vector((0, 0, 2.5 - 1.5 * t))


# ---------------------------------------------------------------- one frame
def build_frame(st):
    clear_dynamic()
    M["skin"].node_tree.nodes["seams"].inputs[1].default_value = 0.025 * st.get("seams", 0.0)

    if st["mode"] == "slices":
        cuts = st["cuts_done"]
        falls = st["falls"]
        t = 2 * R / N_SLICES
        centre_k = N_SLICES // 2
        # slabs already cut off, then the uncut remainder
        for k in range(cuts):
            lo, hi = slab_bounds(k)
            o = tomato_piece(f"slab{k}", lo, hi)
            if k == centre_k:
                calyx(o)
            place_fallen(o, k, falls[k])
        lo = None if cuts == 0 else -R + cuts * t
        rest = tomato_piece("rest", lo, None)
        if cuts <= centre_k:
            calyx(rest)
    else:
        c = -R + 2 * R * st["cut"]
        if st["cut"] < 0.999:
            tomato_piece("tomato", c if st["cut"] > 0 else None, None)
            if c < -0.4:
                calyx()
        if st["pile"] > 0:
            pile(st["pile"], st["cube"])
            if st.get("falling"):
                falling(c, st["pile"], st["cube"], st["seed"])

    kn = st.get("knife")
    if kn == "solid":
        solid_knife(st["kplane"], st["kheight"], st.get("ktilt", 0.0))
    elif kn == "blur":
        ghost_knife(st["kplane"], st["kphase"])

    if st["mode"] == "slices":
        # the slices fan out toward -AX, so start the tomato further along the board
        bpy.context.view_layer.update()
        for o in dyn.objects:
            if o.parent is None:
                o.matrix_world = Matrix.Translation(AX * 1.0) @ o.matrix_world


def main():
    out_dir = sys.argv[1]
    which = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 540
    samples = int(sys.argv[4]) if len(sys.argv) > 4 else 6
    fps3d = int(sys.argv[5]) if len(sys.argv) > 5 else 15
    os.makedirs(out_dir, exist_ok=True)
    build_static(width, samples)
    levels = range(1, 6) if which == "all" else [int(x) for x in which.split(",")]
    done = {}
    for lv in levels:
        for fi, t in level_frames(lv, fps3d):
            path = f"{out_dir}/L{lv}_{fi:04d}.png"
            if os.path.exists(path):
                continue
            st = state_at(lv, t)
            key = json.dumps(st, sort_keys=True)
            if key in done and os.path.exists(done[key]):
                shutil.copy(done[key], path)
                continue
            build_frame(st)
            sc.render.filepath = path
            bpy.ops.render.render(write_still=True)
            done[key] = path
            print(f"RENDERED L{lv} {fi} t={t:.2f}", flush=True)


if __name__ == "__main__":
    main()
