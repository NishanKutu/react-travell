const Faq = require("../models/faqModel");

// Create FAQ
exports.createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res
      .status(201)
      .json({ success: true, data: faq, message: "FAQ created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All FAQs (Grouped for Frontend Display)
exports.getAllFaqs = async (req, res) => {
  try {
    // Sort by order first so the grouping maintains the sequence
    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });

    const grouped = faqs.reduce((acc, curr) => {
      let section = acc.find((s) => s.sectionTitle === curr.section);
      if (!section) {
        section = { sectionTitle: curr.section, categories: [] };
        acc.push(section);
      }

      let category = section.categories.find((c) => c.name === curr.category);
      if (!category) {
        category = { name: curr.category, faqs: [] };
        section.categories.push(category);
      }

      category.faqs.push(curr);
      return acc;
    }, []);

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    res.status(200).json({ success: true, data: faq, message: "FAQ updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
