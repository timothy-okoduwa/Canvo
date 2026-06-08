import EditorLayout from '@/components/editor/EditorLayout';

export default async function EditorPage(props: PageProps<'/editor/[fileId]'>) {
  const { fileId } = await props.params;

  return <EditorLayout fileId={fileId} />;
}
