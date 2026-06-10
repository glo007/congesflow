# Guide de Conception - RNCP Concepteur Développeur d'Application

## Table des matières
1. [Introduction](#introduction)
2. [Diagramme des Cas d'Utilisation](#diagramme-des-cas-dutilisation)
3. [Fonctionnalités Métier](#fonctionnalités-métier)
4. [Conception de la Base de Données](#conception-de-la-base-de-données)

---

## Introduction

La phase de conception transforme l'expression des besoins en architecture technique et logique. Elle comprend trois niveaux de modélisation :

- **Modélisation comportementale** : Décrire ce que fait le système
- **Modélisation dynamique** : Décrire comment le système fonctionne dans le temps
- **Modélisation statique** : Définir la structure des données

---

## Diagramme des Cas d'Utilisation

### Qu'est-ce qu'un cas d'utilisation ?

Un cas d'utilisation décrit **une interaction entre un acteur et le système**, menant à un résultat observable et utile pour l'acteur.

**Éléments clés :**
- **Acteur** : Utilisateur, système externe ou rôle
- **Cas d'utilisation** : Action/fonction du système
- **Scénario** : Séquence d'étapes pour atteindre le résultat

### À quoi ça sert ?

Le diagramme de cas d'utilisation :


- **Identifie tous les acteurs** du système (utilisateurs, systèmes externes)
- **Énumère toutes les interactions** possibles entre acteurs et système
- **Délimite le périmètre** de l'application (ce qui est dedans/dehors)
- **Communique** les besoins fonctionnels de manière visuelle et compréhensible
- **Sert de base** pour tous les diagrammes ultérieurs

### Quand l'utiliser ?

**Moment d'utilisation** : Au démarrage de la phase de conception, immédiatement après l'expression des besoins

**Destinataires** : Clients, utilisateurs, équipe complète (technique et métier)

### Éléments du diagramme

- **Système** : Représenté par un rectangle (frontière)
- **Acteurs** : Représentés par des bonshommes à l'extérieur
- **Cas d'utilisation** : Représentés par des ellipses à l'intérieur
- **Relations** : 
  - Relation simple entre acteur et cas d'utilisation
  - **"Inclut"** : Un cas d'utilisation appelle obligatoirement un autre
  - **"Étend"** : Un cas d'utilisation peut optionnellement faire plus

### Comment le rédiger ?

Un cas d'utilisation doit être documenté avec :

| Élément | Description |
|---------|-------------|
| **Identifiant** | UC01, UC02... (unique) |
| **Nom** | Verbe + complément (ex: "Créer une Commande") |
| **Acteurs principaux** | Qui initie l'interaction |
| **Acteurs secondaires** | Systèmes externes impliqués |
| **Préconditions** | État du système avant l'interaction |
| **Flux principal** | Étapes numérotées du scénario nominal |
| **Flux alternatifs** | Chemins optionnels ou exceptions |
| **Postconditions** | État du système après succès |
| **Points de variation** | Décisions, branchements logiques |

### Critères de qualité

- Chaque cas d'utilisation doit apporter une valeur métier
- Les acteurs doivent être identifiés précisément
- Les préconditions doivent être testables
- Les flux doivent être séquentiels et compréhensibles
- Les postconditions doivent être observables

---

## Fonctionnalités Métier

### Qu'est-ce qu'une fonctionnalité métier ?

Une **fonctionnalité métier** est une capacité du système qui :

- Apporte une **valeur métier directe** (résout un problème réel)
- Répond à un **besoin utilisateur spécifique**
- A un **résultat observable et mesurable**
- Est plus complexe qu'un simple cas d'utilisation isolé

**Différence avec un cas d'utilisation** :

- Un cas d'utilisation est **une interaction** unique
- Une fonctionnalité métier est un **processus complet** qui peut impliquer plusieurs cas d'utilisation

### Structure de documentation d'une fonctionnalité métier

Chaque fonctionnalité métier doit être documentée avec trois diagrammes :

1. **Diagramme d'activité**
2. **Diagramme de séquence**
3. **Diagramme d'état-transition** (si applicable)

---

## Le Diagramme d'Activité

### À quoi ça sert ?

Le diagramme d'activité décrit le **flux de contrôle** d'une fonctionnalité :

- Montre les **étapes successives** d'un processus
- Identifie les **décisions** et les **branches** logiques
- Visualise les **points de synchronisation** (parallélisation)
- Montre les **responsabilités** de chaque acteur/système

### Quand l'utiliser ?

- Pour décrire un **processus métier complexe**
- Quand il y a des **décisions** ou des **boucles**
- Pour montrer les **actions parallèles** (plusieurs éléments simultanément)
- Avant de développer pour **valider la logique** métier

### Éléments clés

- **Activités** (rectangles) : Actions à effectuer
- **Décisions** (losanges) : Points de branchement (SI/SINON)
- **Flux de contrôle** (flèches) : Direction et ordre des actions
- **Points de départ/fin** (cercles pleins) : Début et fin du processus
- **Barres de synchronisation** (traits épais) : Actions parallèles
- **Couloirs** (swim lanes) : Responsabilités par acteur/système

### Ce qu'il révèle

- La **logique métier** du processus
- Les **points critiques** (décisions, validations)
- Les **itérations** ou **boucles**
- Les **chemins exceptionnels**
- Les **dépendances** entre acteurs

---

## Le Diagramme de Séquence

### À quoi ça sert ?

Le diagramme de séquence décrit les **interactions chronologiques** :

- Montre **qui communique avec qui** et dans quel **ordre**
- Visualise les **échanges de messages** entre acteurs/systèmes
- Identifie les **dépendances temporelles**
- Valide que les **bonnes informations** sont échangées au **bon moment**

### Quand l'utiliser ?

- Pour détailler une **interaction complexe** entre plusieurs entités
- Quand il faut garantir un **ordre précis** d'opérations
- Pour valider les **appels API** ou **services externes**
- Pour documenter les **protocoles de communication**

### Éléments clés

- **Acteurs/Objets** (en haut) : Les entités qui participent
- **Lignes pointillées** : Cycle de vie des objets
- **Flèches** : Messages/appels entre entités
- **Rectangles** : Activations (période où une entité agit)
- **Notes** : Conditions ou informations supplémentaires

### Ce qu'il révèle

- L'**ordre des appels** système
- Les **données échangées** à chaque étape
- Les **dépendances de timing** (A doit avant B)
- Les **systèmes externes** impliqués
- Les **retours/réponses** attendues

---

## Le Diagramme d'État-Transition

### À quoi ça sert ?

Le diagramme d'état-transition décrit les **états possibles** d'un objet et comment il **passe d'un état à l'autre** :

- Énumère les **états stables** d'une entité
- Définit les **conditions** (transitions) pour changer d'état
- Identifie les **états invalides** ou **impossibles**
- Garantit la **cohérence métier** des changements

### Quand l'utiliser ?

- Pour modéliser des **processus avec états** (commande : panier → payée → livrée)
- Quand des **transitions** ont des **conditions** ou des **actions**
- Pour documenter les **autorisations de changement** d'état
- Quand il faut **prévenir les transitions invalides**

### Éléments clés

- **États** (cercles/rectangles) : Situations stables
- **Transitions** (flèches) : Passage d'un état à un autre
- **Conditions** (entre crochets) : Conditions pour la transition
- **Actions** (après slash) : Opérations lors de la transition
- **État initial** (cercle plein) : Point de départ
- **État final** (cercle doublé) : Point terminal

### Ce qu'il révèle

- Les **règles métier** de changement d'état
- Les **états impossibles** à atteindre
- Les **chemins critiques** et **alternatives**
- Les **actions déclenchées** automatiquement
- La **sécurité** du modèle (pas de contradictions)

### Exemple type de processus avec états

Un objet "Commande" passe par : création → validation → paiement → expédition → livraison

À chaque étape, certaines transitions sont possibles, d'autres non.

---

## Structure de Documentation par Fonctionnalité Métier

### Étape 1 : Description générale

Décrire brièvement :

- **Le contexte** : Pourquoi cette fonctionnalité existe ?
- **Les acteurs** : Qui l'utilise ?
- **Le résultat attendu** : Qu'est-ce qui change dans le système ?

### Étape 2 : Diagramme d'activité

Montrer :

- Les **étapes du processus**
- Les **décisions** et les branches
- Les **responsabilités** par acteur/système
- Les **actions parallèles** éventuelles

**Valider avec** : Responsable métier

### Étape 3 : Diagramme de séquence

Montrer :

- L'**ordre chronologique** des actions
- Les **interactions** entre systèmes
- Les **données** échangées
- Les **retours** et **vérifications**

**Valider avec** : Architecte technique et métier

### Étape 4 : Diagramme d'état-transition (si applicable)

Montrer :

- Les **états** critiques de la fonctionnalité
- Les **transitions** autorisées
- Les **conditions** de passage
- Les **actions** déclenchées

**Valider avec** : Responsable métier et développeur

---

## Conception de la Base de Données

### Principes fondamentaux

La conception de la base de données détermine :

- **L'intégrité des données** : Pas de doublons, cohérence garantie
- **Les performances** : Vitesse des requêtes
- **L'évolutivité** : Capacité à grandir sans refonte
- **La maintenabilité** : Facilité de compréhension et modification

### Niveaux de modélisation

La modélisation de données se fait en trois étapes :

#### 1. Modèle Conceptuel (MCD - MERISE ou UML)

**Objectif** : Représenter le monde réel en termes d'**entités** et de **relations**

**Délivrables** :
- Identification des **entités** (CLIENT, PRODUIT, COMMANDE, etc.)
- Identification des **propriétés** de chaque entité
- Identification des **relations** entre entités
- Définition des **cardinalités** (1,1 / 1,N / N,N)

**Utilisateurs** : Métier, analystes, architectes

**Langage** : Diagramme (pas de SQL)

**Points clés** :

- Chaque entité doit être **identifiable** (clé primaire)
- Les relations doivent être **signifiantes** (apporter du contexte)
- Les cardinalités doivent être **justifiées métier**

#### 2. Modèle Logique (MLD - MERISE)

**Objectif** : Transformer le MCD en **structure relationnelle** (tables)

**Délivrables** :

- Transformation des entités en **tables**
- Transformation des relations en **colonnes (clés étrangères)** ou **tables d'association**
- Définition des **clés primaires** et **clés étrangères**
- Résolution des relations **N,N** en deux relations 1,N

**Points clés** :

- Une table = une entité
- Les clés étrangères = les relations
- Les tables d'association = les relations N,N

#### 3. Modèle Physique (SQL)

**Objectif** : Générer le **code SQL** exécutable

**Délivrables** :

- Requêtes **CREATE TABLE**
- **Types de données** appropriés
- **Contraintes** (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK)
- **Index** pour optimiser les requêtes

**Points clés** :

- Les types de données doivent correspondre aux besoins
- Les contraintes garantissent la cohérence
- Les index améliorent les performances

---

## Approche MERISE

### Avantages

- **Très structuré** : Processus clair et reproductible
- **Exhaustif** : Force à penser tous les détails
- **Diagrammes reconnus** : Comprendre par tous les professionnels
- **Transposition simple** : MCD → MLD → SQL directe

## Approche UML

### Avantages

- **Orientée objet** : Naturel pour les développeurs OOP
- **Flexible** : Moins de règles strictes que MERISE
- **Intégré** : Peut être combiné avec d'autres diagrammes UML
- **Diagrammes variés** : Classes, séquence, cas d'utilisation en même notation


---

## Éléments essentiels du MCD/UML

### Entité / Classe

Une entité représente une **catégorie d'objets du monde réel** (CLIENT, PRODUIT, etc.)

Propriétés :

- Doit avoir une **clé primaire** (identifiant unique)
- Contient des **attributs** (propriétés)
- Doit être **indépendante** (pas à dépendre d'une autre pour exister)

### Relation / Association

Une relation représente une **interaction métier** entre entités

Exemple : "Un CLIENT **PASSE** une COMMANDE" (relation entre CLIENT et COMMANDE)

### Cardinalités

Les cardinalités définissent "**combien**" :

- **1,1** (un à un) : Entité A a EXACTEMENT UN entité B
- **1,N** (un à plusieurs) : Entité A peut avoir PLUSIEURS entité B
- **N,N** (plusieurs à plusieurs) : Les deux entités peuvent avoir plusieurs relations

**Justification métier requise** pour chaque cardinalité

---

## Contraintes d'Intégrité

Les contraintes garantissent la **cohérence des données** :

- **Clé Primaire (PK)** : Identifie uniquement chaque enregistrement
- **Clé Étrangère (FK)** : Assure la référence vers une autre table
- **UNIQUE** : Pas de doublons pour ce champ (ex: email)
- **NOT NULL** : Champ obligatoire
- **CHECK** : Règle métier (ex: prix >= 0)
- **DEFAULT** : Valeur par défaut si non spécifiée

### Principes de normalisation

**Formes Normales** : Règles pour éviter la redondance et l'anomalie

- **1ère Forme Normale (1NF)** : Pas d'attributs répétés (pas de listes dans une colonne)
- **2e Forme Normale (2NF)** : Chaque attribut dépend de LA CLÉ ENTIÈRE, pas d'une partie
- **3e Forme Normale (3NF)** : Pas de dépendances entre attributs non-clés

Objectif : **Eliminer les redondances** et **faciliter les mises à jour**

---

## Checklist de Validation - Diagrammes

### Cas d'Utilisation
- [ ] Tous les acteurs identifiés et distincts
- [ ] Chaque cas d'utilisation a un nom claire (verbe + objet)
- [ ] Préconditions et postconditions définies
- [ ] Flux alternatifs documentés
- [ ] Les relations "inclut" et "étend" sont justifiées

### Diagramme d'Activité
- [ ] Points de départ et fin clairs
- [ ] Toutes les décisions représentées (losanges)
- [ ] Flux de contrôle sans ambiguïté
- [ ] Acteurs/systèmes identifiés (swim lanes si pertinent)
- [ ] Actions parallèles correctement synchronisées

### Diagramme de Séquence
- [ ] Acteurs/objets clairement identifiés en haut
- [ ] Ordre chronologique respecté
- [ ] Messages/appels complets (paramètres, retours)
- [ ] Interactions avec systèmes externes validées
- [ ] Points d'erreur/exception identifiés

### Diagramme d'État-Transition
- [ ] États initiaux et finaux clairs
- [ ] Transitions non ambigües
- [ ] Conditions de transition explicites
- [ ] Pas de transitions impossibles
- [ ] Actions lors des transitions spécifiées

---

## Checklist de Validation - Base de Données

### Modèle Conceptuel
- [ ] Toutes les entités métier identifiées
- [ ] Chaque entité a une clé primaire
- [ ] Relations justifiées métier
- [ ] Cardinalités vérifiées avec experts métier
- [ ] Pas d'entité redondante

### Modèle Logique
- [ ] Chaque entité = une table
- [ ] Relations N,N transformées en tables d'association
- [ ] Clés étrangères correctement définies
- [ ] Pas d'anomalies (insertion, suppression, modification)
- [ ] Normalisation vérifiée (3NF)

### Modèle Physique (SQL)
- [ ] Toutes les tables créées
- [ ] Types de données appropriés
- [ ] Contraintes (PK, FK, UNIQUE, NOT NULL, CHECK)
- [ ] Index définis pour les requêtes fréquentes
- [ ] SQL syntaxiquement correct et testable

---

## Synchronisation entre Diagrammes

**Important** : Les diagrammes doivent être **cohérents** :

- Les **cas d'utilisation** doivent correspondre aux **fonctionnalités métier**
- Les **entités** du MCD doivent correspondre aux **objets** des diagrammes
- Les **acteurs** des cas d'utilisation doivent être les mêmes dans tous les diagrammes
- Les **données échangées** dans les séquences doivent être dans le MCD

**Valider la cohérence** entre chaque phase est **critiqued** pour la qualité finale.

---

## Livrables de la Phase de Conception

1. **Diagramme des Cas d'Utilisation** (1 par projet)
2. **Pour chaque fonctionnalité métier identifiée** :
   - Diagramme d'activité
   - Diagramme de séquence
   - Diagramme d'état-transition (si applicable)
3. **Modèle Conceptuel** (MCD en MERISE ou UML)
4. **Modèle Logique** (MLD - structure de tables)
5. **Modèle Physique** (SQL complet prêt à exécuter)
6. **Documentation textuelle** pour chaque diagramme

---

## Conclusion

La phase de conception est **fondamentale** :

- Elle **clarifie** les exigences avant le développement
- Elle **anticipe** les problèmes techniques
- Elle **facilite** la communication entre tous les acteurs
- Elle **documente** le système pour la maintenance future

**Points clés à retenir** :

1. **Chaque diagramme a un objectif précis** - Ne pas les mélanger
2. **Valider régulièrement** avec les experts métier
3. **Itérer** si nécessaire jusqu'à cohérence totale
4. **Documenter** les justifications métier des choix
5. **Synchroniser** tous les diagrammes entre eux

La qualité de la conception **détermine directement** la qualité du produit final.
