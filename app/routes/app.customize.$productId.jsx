import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, Box, DropZone, LegacyStack, Thumbnail, Toast, Frame } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Cette fonction s'exécute côté serveur pour charger les données
export async function loader({ request, params }) {
  // Authentification avec Shopify
  const { admin } = await authenticate.admin(request);
  const productId = params.productId;

  // Récupère les styles depuis la base de données
  const styles = await db.style.findMany();

  // Récupère les informations du produit depuis Shopify
  const productResponse = await admin.graphql(
    `#graphql
    query Product($id: ID!) {
      product(id: $id) {
        id
        title
        featuredImage {
          url
        }
      }
    }`,
    {
      variables: {
        id: `gid://shopify/Product/${productId}`,
      },
    }
  );
  
  const productData = await productResponse.json();
  const product = productData.data.product;

  return json({ styles, product });
}

// Cette fonction s'exécute quand l'utilisateur soumet le formulaire
export async function action({ request }) {
  const formData = await request.formData();

  const uploadedFile = formData.get("petPhoto");
  const selectedStyleId = formData.get("styleId");
  const productId = formData.get("productId");

  if (!uploadedFile || !selectedStyleId || !productId) {
    return json({ error: "Veuillez fournir une photo et un style.", success: false }, { status: 400 });
  }

  // Pour un MVP, nous allons simuler l'appel à l'API d'IA
  // En production, vous utiliseriez un service comme AWS S3 pour stocker l'image
  // et appelleriez une vraie API d'IA comme Stability AI
  
  // Simulons une URL d'image générée
  const generatedImageUrl = "https://via.placeholder.com/400x400/0000FF/FFFFFF?text=Image+IA+Générée";

  // Sauvegarde dans la base de données
  const generatedRecord = await db.generatedImage.create({
    data: {
      originalImageUrl: "https://via.placeholder.com/400x400/FF0000/FFFFFF?text=Image+Originale",
      generatedImageUrl,
      styleId: selectedStyleId,
      productId: productId,
    },
  });

  return json({
    success: true,
    generatedImageUrl: generatedRecord.generatedImageUrl,
    generatedImageId: generatedRecord.id,
    message: "Image générée avec succès !",
  });
}

// Le composant React qui affiche l'interface utilisateur
export default function CustomizeProduct() {
  const { styles, product } = useLoaderData();
  const actionData = useActionData();
  const [files, setFiles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(actionData?.generatedImageUrl || null);
  const [generatedImageId, setGeneratedImageId] = useState(actionData?.generatedImageId || null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Gestion de l'upload de fichier
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
    [],
  );

  const fileUpload = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={URL.createObjectURL(file)}
          />
          <div>
            {file.name}{" "}
            <Text variant="bodySm" as="p">
              {file.size} octets
            </Text>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const uploadedFile = files[0];

  // Fonction pour ajouter au panier (simulation pour le MVP)
  const handleAddToCart = async () => {
    if (!generatedImageUrl || !generatedImageId) {
      setToastMessage("Veuillez générer une image avant d'ajouter au panier.");
      setToastError(true);
      setShowToast(true);
      return;
    }

    // Dans une vraie implémentation, vous utiliseriez l'API Shopify
    // Pour l'instant, nous simulons juste un message de succès
    setToastMessage("Produit ajouté au panier (simulation) !");
    setToastError(false);
    setShowToast(true);
  };

  // Met à jour l'état si l'action a réussi
  useState(() => {
    if (actionData?.success) {
      setGeneratedImageUrl(actionData.generatedImageUrl);
      setGeneratedImageId(actionData.generatedImageId);
      setToastMessage(actionData.message);
      setToastError(false);
      setShowToast(true);
    } else if (actionData?.error) {
      setToastMessage(actionData.error);
      setToastError(true);
      setShowToast(true);
    }
  }, [actionData]);

  const toastMarkup = showToast ? (
    <Toast content={toastMessage} error={toastError} onDismiss={() => setShowToast(false)} />
  ) : null;

  return (
    <Frame>
      <Page
        title={`Personnaliser ${product?.title || "votre produit"}`}
        subtitle="Transformez la photo de votre animal en œuvre d'art !"
        backAction={{ content: "Produits", url: "/admin/products" }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Text variant="headingMd" as="h2">
                1. Téléchargez la photo de votre animal
              </Text>
              <Box paddingBlockStart="200">
                <DropZone onDrop={handleDropZoneDrop} accept="image/*" type="file">
                  {uploadedFile ? (
                    fileUpload
                  ) : (
                    <Text as="span" variant="bodyMd">
                      Glissez-déposez ou cliquez pour sélectionner une image (JPEG, PNG).
                    </Text>
                  )}
                </DropZone>
                {uploadedFile && (
                  <Text variant="bodySm" as="p" color="subdued">
                    Fichier sélectionné : {uploadedFile.name}
                  </Text>
                )}
              </Box>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <Text variant="headingMd" as="h2">
                2. Choisissez un style artistique
              </Text>
              <Box paddingBlockStart="200">
                <LegacyStack wrap spacing="loose">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      style={{
                        cursor: 'pointer',
                        padding: '10px',
                        border: selectedStyle?.id === style.id ? '2px solid #008060' : '1px solid #ddd',
                        borderRadius: '8px',
                        margin: '10px',
                        textAlign: 'center'
                      }}
                    >
                      <img 
                        src={style.thumbnailUrl} 
                        alt={style.name} 
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                      <Text variant="bodyMd" as="p">{style.name}</Text>
                    </div>
                  ))}
                </LegacyStack>
              </Box>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <Text variant="headingMd" as="h2">
                3. Générez et prévisualisez
              </Text>
              <Box paddingBlockStart="200">
                <Form method="post" encType="multipart/form-data">
                  <input type="hidden" name="styleId" value={selectedStyle?.id || ""} />
                  <input type="hidden" name="productId" value={product?.id.split('/').pop() || ""} />
                  {uploadedFile && (
                    <input type="file" name="petPhoto" style={{ display: 'none' }} />
                  )}
                  <Button
                    submit
                    primary
                    disabled={!uploadedFile || !selectedStyle}
                  >
                    Générer l'image IA
                  </Button>
                </Form>

                {generatedImageUrl && (
                  <Box paddingBlockStart="400">
                    <Text variant="headingMd" as="h3">
                      Résultat de la génération IA :
                    </Text>
                    <Box paddingBlockStart="200">
                      <img
                        src={generatedImageUrl}
                        alt="Résultat de la transformation par IA"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                        loading="lazy"
                      />
                      <Box paddingBlockStart="400">
                        <Button primary onClick={handleAddToCart}>
                          Ajouter au panier
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  );
}
