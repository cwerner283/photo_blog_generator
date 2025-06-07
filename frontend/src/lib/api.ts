export async function generateBlog(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/generate-blog`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate blog post');
  }

  return res.json();
}
