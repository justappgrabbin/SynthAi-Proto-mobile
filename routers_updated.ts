// This is the updated material.ingest implementation
// Replace lines 165-222 in routers.ts with this:

        // Extract resonance signature from the material
        const resonanceSignature = await extractResonanceSignature(
          input.content,
          input.fileName,
          input.fileType
        );

        // Map modules based on resonance properties
        const mappedModules = resonanceSignature.resonanceProperties.gates.length > 0
          ? ["GNN", "Resonance", "Embodied Reality"]
          : ["Science Lab"];

        // Store material with resonance signature in metadata
        const result = await db.addIngestedMaterial(
          ctx.user.id,
          input.fileName,
          input.fileType,
          input.content,
          mappedModules,
          resonanceSignature.summary,
          { resonanceSignature }
        );

        return {
          success: true,
          materialId: (result as any).insertId || 0,
          mappedModules,
          resonanceSignature,
          formattedAnalysis: formatResonanceSignature(resonanceSignature),
        };
