/*
 * This module will update an IREC reservation to finalize and close it :
 * INPUT : facture num + voucher + refac si besoin
 * - checks if the facture and refac are indeed stored in the NAS
 * - then writes the fact num, voucher and refac num in the comment
 * - finally it puts the code "Facture émise" in the reservation to close it
 */

// returns a boolean that tells if the fact_num has been saved in dir_path or not
function factSaved(fact_num, dir_path) {

}
