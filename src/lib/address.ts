export interface AddressFields {
  street: string;
  number: string;
  neighborhood: string;
  zipCode: string;
}

// Monta o endereço em um formato único (Rua, nº — Bairro — CEP), reaproveitado
// tanto no cadastro manual de cliente quanto no checkout do cardápio digital,
// pra manter o mesmo padrão em qualquer lugar que o endereço é salvo.
export function composeAddress(fields: AddressFields): string {
  const streetLine = [fields.street, fields.number && `nº ${fields.number}`]
    .filter(Boolean)
    .join(", ");
  const parts = [streetLine, fields.neighborhood, fields.zipCode && `CEP ${fields.zipCode}`].filter(
    Boolean
  );
  return parts.join(" - ");
}
