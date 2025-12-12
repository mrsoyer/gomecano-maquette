# 📁 Images Gomecano - Maquette

## 🔗 Images à Télécharger

### Hero Section

#### 1. Mécanicien Professionnel
**Source recommandée** : Unsplash  
**URLs** :
- https://unsplash.com/photos/man-in-black-and-white-stripe-long-sleeve-shirt-standing-beside-black-car-KdeqA3aTnBY
- https://unsplash.com/photos/man-in-black-jacket-holding-black-smartphone-8OyKWQgBsKQ
- https://unsplash.com/photos/man-in-blue-denim-jacket-holding-silver-and-black-hand-tool-5QgIuuBxKwM

**Instructions** :
1. Télécharger en haute résolution
2. Renommer : `mechanic-hero.jpg`
3. Convertir en WebP : `mechanic-hero.webp`
4. Placer dans `/public/images/hero/`

#### 2. Voiture Moderne
**URLs** :
- https://unsplash.com/photos/white-and-black-coupe-8NxM2v3j2PA
- https://unsplash.com/photos/white-porsche-911-parked-in-front-of-building-JVD3XPqjLaQ

**Instructions** :
1. Télécharger
2. Renommer : `car-modern.jpg` → `car-modern.webp`
3. Placer dans `/public/images/hero/`

### Services Icons

**Source** : 3dicons.co ou IconScout

**Alternative** : Utiliser des emojis 3D
- 🛢️ Vidange
- 🔴 Freins
- 🔧 Révision
- 📊 Diagnostic
- 🔋 Batterie
- ❄️ Climatisation

### Témoignages Avatars

**Source** : UI Faces ou Random User Generator

**URLs** :
- https://randomuser.me/api/portraits/men/32.jpg
- https://randomuser.me/api/portraits/women/44.jpg
- https://randomuser.me/api/portraits/men/67.jpg

---

## 📂 Structure des Dossiers

```
public/images/
├── hero/
│   ├── mechanic-hero.webp
│   ├── mechanic-hero.jpg
│   ├── car-modern.webp
│   └── background-pattern.svg
├── services/
│   ├── icon-vidange.svg
│   ├── icon-freins.svg
│   ├── icon-revision.svg
│   ├── icon-diagnostic.svg
│   ├── icon-batterie.svg
│   └── icon-climatisation.svg
├── home/
│   ├── intervention.webp
│   └── dashboard-mobile.png
└── testimonials/
    ├── avatar-1.jpg
    ├── avatar-2.jpg
    └── avatar-3.jpg
```

---

## 🚀 Scripts de Conversion

### WebP Conversion

```bash
# macOS
brew install webp

# Convertir toutes les images JPG en WebP
cd public/images/hero
for img in *.jpg; do
  cwebp -q 85 "$img" -o "${img%.jpg}.webp"
done
```

### Optimisation

```bash
# Installer ImageOptim CLI (macOS)
npm install -g imageoptim-cli

# Optimiser toutes les images
imageoptim public/images/**/*
```

---

## ✅ Checklist

- [ ] Télécharger mechanic-hero.jpg
- [ ] Télécharger car-modern.jpg
- [ ] Générer background-pattern.svg
- [ ] Télécharger 6 icônes services (SVG)
- [ ] Télécharger 3 avatars témoignages
- [ ] Convertir toutes en WebP
- [ ] Optimiser toutes les images
- [ ] Tester le responsive design

---

**Voir** : `IMAGES-GENERATION.md` pour plus de détails






