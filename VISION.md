# Visie — Akeneo Companion

## Probleem

Op LedKoning-PDP's worden regelmatig afwijkingen gesignaleerd, maar het is niet direct duidelijk of de oorzaak in Akeneo zit (incomplete of foute data) of in de webshop-weergave. Om dat nu te checken moet iemand handmatig de SKU opzoeken in de Akeneo-backend — een context-switch die tijd kost en drempel opwerpt om het überhaupt te checken.

## Doelgroep

Uitsluitend het content/PIM-team bij LedKoning — collega's die PDP-kwaliteit beoordelen.

Nadrukkelijk geen doelgroep: developers, support/CRO, externe partijen, andere bedrijven, andere Akeneo-gebruikers buiten LedKoning.

## Differentiatie — waarom dit, waarom nu

Eén klik op de extensie, direct op de PDP zelf, geeft inzicht in de Akeneo-completeness van dat product — zonder los in te loggen op Akeneo en handmatig de SKU op te zoeken. De browserextensie zit letterlijk waar het probleem zichtbaar wordt (de PDP), niet in een apart systeem.

**Waarom nu:** PDP-datakwaliteit is een actueel, terugkerend pijnpunt; dit is een snelle, lichte oplossing (een extensie, geen nieuw backend-systeem) die het probleem direct aanpakt.

## Non-goals

- Geen schrijftoegang tot Akeneo (fase 1) — puur uitlezen.
- Geen vervanging van Akeneo zelf of van pimport.
- Geen externe distributie (geen publieke Chrome Web Store-listing) — blijft een intern LedKoning-hulpmiddel.
- Geen multi-tenant, geen klantbeheer, geen pricing.

## Definitie van succes (12 maanden)

Het content/PIM-team gebruikt de extensie structureel bij het beoordelen van PDP's.
