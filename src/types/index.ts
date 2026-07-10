export interface IdentificationResult {
  commonName: string;
  scientificName: string;
  confidence: number;
}

export interface GBIFSpecies {
  key: number;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  scientificName?: string;
  taxonomicStatus?: string;
  vernacularName?: string;
}

export interface GBIFDescription {
  type?: string;
  description: string;
  language?: string;
}

export interface iNatTaxon {
  preferred_common_name?: string;
  conservation_status?: {
    status?: string;
    status_name?: string;
  };
  wikipedia_url?: string;
  default_photo?: {
    medium_url?: string;
  };
  observations_count?: number;
}

export interface OrganismResult {
  identification: IdentificationResult;
  taxonomy: GBIFSpecies | null;
  descriptions: GBIFDescription[];
  conservationStatus: string | null;
  wikipediaUrl: string | null;
  photoUrl: string | null;
  observationsCount: number | null;
}
