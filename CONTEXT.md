# Akeneo Companion

Browserextensie waarmee het content/PIM-team van LedKoning vanaf een PDP direct ziet hoe de bijbehorende productdata in Akeneo ervoor staat.

## Webshop

**Storefront**:
Een LedKoning-webshopdomein (bijv. `.nl`, `.be`, `.de`, of een staging-host) waarop de extensie werkt. Elke storefront hoort bij precies één locale.
_Avoid_: site, shop, domein (als synoniem)

**PDP**:
De productdetailpagina van één product op een storefront.
_Avoid_: productpagina, detailpagina

**SKU**:
De code waarmee een PDP naar een product of product model in Akeneo verwijst.
_Avoid_: artikelnummer, product code, identifier

## Akeneo

**Locale**:
Een Akeneo-taal/regio-code (bijv. `nl_NL`) waarvoor attribuutwaarden gelden; afgeleid van de storefront.
_Avoid_: taal, land

**Product**:
Eén verkoopbaar artikel in Akeneo, met een eigen SKU. Een product dat onder een product model valt is een **variant**.
_Avoid_: item, artikel

**Product model**:
De ouder in Akeneo die varianten groepeert en hun gedeelde waarden draagt. Een PDP kan naar een product model verwijzen in plaats van naar een product.
_Avoid_: parent, configurable, hoofdproduct

**Family**:
De set attributen die voor een product of product model geldt, inclusief welke daarvan verplicht zijn.
_Avoid_: productfamilie, template

**Attribute group**:
Een benoemde, geordende groepering van attributen, gebruikt om ze bij elkaar te tonen.
_Avoid_: sectie, categorie
