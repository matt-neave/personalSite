import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Use vscDarkPlus theme for syntax highlighting
import { parseMetadata } from './metadataParser'; // Assuming you have a metadataParser utility

const BlogPost = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        const username = 'matt-neave';
        const repository = 'personalSite';
        const branch = 'main';
        const path = `https://raw.githubusercontent.com/${username}/${repository}/${branch}/public/posts/post${id}.md`;

        const response = await fetch(path);
        if (!response.ok) {
          throw new Error('Failed to load the post');
        }

        const text = await response.text();
        const { title, date, author, content } = parseMetadata(text);
        setTitle(title);
        setDate(date);
        setAuthor(author);
        setContent(content);
      } catch (error) {
        console.error('Error loading post:', error);
      }
    };

    loadPost();
  }, [id]);

  // Custom renderers for ReactMarkdown to handle code blocks with syntax highlighting
  const renderers = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus} // Use the vscDarkPlus theme for syntax highlighting
          language={match[1].toLowerCase()} // Use the language specified in the Markdown
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

	// Link renderer
	a: ({ href, children }) => {
		return (
		  <a
			href={href}
			style={{
			  color: '#ff8c00', // Set the desired color for the link
			  textDecoration: 'none' // Optional: Remove the underline from the link
			}}
			target="_blank" // Optional: Open the link in a new tab
			rel="noopener noreferrer" // Security for external links
		  >
			{children}
		  </a>
		);
	  },

    // Custom image renderer for handling relative image paths
	img: ({ alt, src }) => {
		const imageUrl = `../${src}`;
		console.log(imageUrl);
  
		return (
		<img
			src={imageUrl}
			alt={alt}
			style={{
				maxWidth: '60%',    // Set a smaller maximum width for the image (adjust as needed)
				height: 'auto',     // Keep the aspect ratio
				display: 'block',   // Display the image as a block element
				// margin: '20px auto' // Center the image and add some margin above and below				
				margin: 'auto' // Center the image and add some margin above and below
			}}
		/>
		);
	},
  };

  return (
    <div className="blog-post">
      <p>Date: {date} | Author: {author}</p>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={renderers} // Use custom renderers to handle code blocks and images
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default BlogPost;
